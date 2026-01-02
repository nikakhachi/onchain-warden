import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";

export const validateToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const tokenRecord = await ctx.db
      .query("access_tokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();

    if (!tokenRecord) throw new ConvexError("Invalid token");

    if (tokenRecord.expires_at < Date.now()) throw new ConvexError("Token expired");

    const user = await ctx.db.get(tokenRecord.user_id);

    if (!user) throw new ConvexError("User not found");

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

    if (!tokenRecord) throw new ConvexError("Invalid token");

    if (tokenRecord.expires_at < Date.now()) throw new ConvexError("Token expired");

    const user = await ctx.db.get(tokenRecord.user_id);

    if (!user) throw new ConvexError("User not found");

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

    if (!user) throw new ConvexError("User not found");

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
