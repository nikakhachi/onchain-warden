import { ActionCtx, internalMutation, mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";
import { ERROR_MESSAGES } from "./errors/errorMessages";

export const validateToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("access_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!tokenRecord) throw new ConvexError(ERROR_MESSAGES.INVALID_TOKEN);

    if (tokenRecord.expires_at < Date.now()) throw new ConvexError(ERROR_MESSAGES.TOKEN_EXPIRED);

    const user = await ctx.db.get(tokenRecord.user_id);

    if (!user) throw new ConvexError(ERROR_MESSAGES.USER_NOT_FOUND);

    return user;
  },
});

export const getUserByAccessToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("access_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!tokenRecord) throw new ConvexError(ERROR_MESSAGES.INVALID_TOKEN);

    if (tokenRecord.expires_at < Date.now()) throw new ConvexError(ERROR_MESSAGES.TOKEN_EXPIRED);

    const user = await ctx.db.get(tokenRecord.user_id);

    if (!user) throw new ConvexError(ERROR_MESSAGES.USER_NOT_FOUND);

    return user;
  },
});

export const createAccessToken = internalMutation({
  args: {
    token: v.string(),
    owner: v.string(),
    expires_at: v.number(),
    created_at: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.users.getExistingUserByWalletAddress, { wallet_address: args.owner });

    if (!user) throw new ConvexError(ERROR_MESSAGES.USER_NOT_FOUND);

    const existingTokens = await ctx.db
      .query("access_tokens")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    for (const existingToken of existingTokens) {
      await ctx.db.delete(existingToken._id);
    }

    await ctx.db.insert("access_tokens", { token: args.token, user_id: user._id, expires_at: args.expires_at });
  },
});

export const cleanupExpiredTokens = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredTokens = await ctx.db
      .query("access_tokens")
      .filter((q) => q.lt(q.field("expires_at"), now))
      .collect();

    for (const token of expiredTokens) {
      await ctx.db.delete(token._id);
    }
  },
});

// Internal Auth Validations

export const _mustBeAuthenticated = async (ctx: QueryCtx | ActionCtx | MutationCtx, access_token: string) => {
  const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: access_token })) as Doc<"users">;

  return { user };
};

export const _mustBeTeamOwner = async (
  ctx: QueryCtx | ActionCtx | MutationCtx,
  team_id: Id<"teams">,
  access_token: string,
) => {
  const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: access_token })) as Doc<"users">;

  const team = await ctx.runQuery(internal.team.getTeamById, { id: team_id });
  if (!team) throw new ConvexError(ERROR_MESSAGES.TEAM_NOT_FOUND);

  if (team.owner_user_id !== user._id) throw new ConvexError(ERROR_MESSAGES.NOT_THE_OWNER);

  return { user, team };
};

export const _mustBeTeamAdmin = async (
  ctx: QueryCtx | ActionCtx | MutationCtx,
  team_id: Id<"teams">,
  access_token: string,
) => {
  const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: access_token })) as Doc<"users">;

  const team = await ctx.runQuery(internal.team.getTeamById, { id: team_id });
  if (!team) throw new ConvexError(ERROR_MESSAGES.TEAM_NOT_FOUND);

  const member = await ctx.runQuery(internal.teamMembers.getTeamMember, { team_id, user_id: user._id });

  if (member?.role !== "admin" && team.owner_user_id !== user._id) throw new ConvexError(ERROR_MESSAGES.NOT_AN_ADMIN);

  return { user, team, member };
};

export const _mustBeTeamMember = async (
  ctx: QueryCtx | ActionCtx | MutationCtx,
  team_id: Id<"teams">,
  access_token: string,
) => {
  const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: access_token })) as Doc<"users">;

  const team = await ctx.runQuery(internal.team.getTeamById, { id: team_id });
  if (!team) throw new ConvexError(ERROR_MESSAGES.TEAM_NOT_FOUND);

  const member = await ctx.runQuery(internal.teamMembers.getTeamMember, { team_id, user_id: user._id });

  if (!member && team.owner_user_id !== user._id) throw new ConvexError(ERROR_MESSAGES.NOT_A_MEMBER);

  return { user, team, member };
};
