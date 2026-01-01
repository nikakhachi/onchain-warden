import { ConvexError, v } from "convex/values";
import { internalQuery, mutation } from "./_generated/server";
import { api } from "./_generated/api";
import { getAddress } from "viem";
import { Doc } from "./_generated/dataModel";

export const createTeam = mutation({
  args: {
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.runMutation(api.auth.validateToken, { token: args.accessToken })) as Doc<"users">;

    await ctx.db.insert("teams", { name: args.name, owner_user_id: user._id });
  },
});

export const editTeamName = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.runMutation(api.auth.validateToken, { token: args.accessToken })) as Doc<"users">;

    const existingTeam = await ctx.db.get(args.id);

    if (!existingTeam) throw new ConvexError("Team not found");

    if (existingTeam.owner_user_id !== user._id) throw new ConvexError("Unauthorized");

    return await ctx.db.patch(args.id, { name: args.name });
  },
});

export const changeTeamOwner = mutation({
  args: {
    id: v.id("teams"),
    new_owner_wallet_address: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.runMutation(api.auth.validateToken, { token: args.accessToken })) as Doc<"users">;

    const existingTeam = await ctx.db.get(args.id);

    if (!existingTeam) throw new ConvexError("Team not found");

    if (existingTeam.owner_user_id !== user.wallet_address) throw new ConvexError("Unauthorized");

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_wallet_address", (q) => q.eq("wallet_address", getAddress(args.new_owner_wallet_address)))
      .unique();

    if (!existingUser) throw new ConvexError("New Owner not found");

    return await ctx.db.patch(args.id, { owner_user_id: existingUser._id });
  },
});

export const isTeamOwner = internalQuery({
  args: { id: v.id("teams"), user_id: v.id("users") },
  handler: async (ctx, args) => {
    const existingTeam = await ctx.db.get(args.id);

    if (!existingTeam) throw new ConvexError("Team not found");

    return existingTeam.owner_user_id === args.user_id;
  },
});

export const getTeamById = internalQuery({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});
