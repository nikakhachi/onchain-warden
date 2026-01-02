import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { getAddress } from "viem";
import { _mustBeAuthenticated, _mustBeTeamOwner } from "./auth";

export const getTeamById = internalQuery({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    const teamId = await ctx.db.insert("teams", { name: args.name, owner_user_id: user._id });
    return teamId;
  },
});

export const editTeamName = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    await _mustBeTeamOwner(ctx, args.id, args.accessToken);

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
    await _mustBeTeamOwner(ctx, args.id, args.accessToken);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_wallet_address", (q) => q.eq("wallet_address", getAddress(args.new_owner_wallet_address)))
      .unique();

    if (!existingUser) throw new ConvexError("New Owner not found");

    return await ctx.db.patch(args.id, { owner_user_id: existingUser._id });
  },
});

export const getTeamsByUserAccessToken = query({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    return ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("owner_user_id", user._id))
      .collect();
  },
});
