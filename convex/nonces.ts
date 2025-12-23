import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";

export const createNonceIfNotExists = internalMutation({
  args: { nonce: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nonces")
      .withIndex("by_nonce", (q) => q.eq("nonce", args.nonce))
      .unique();

    if (existing) {
      throw new ConvexError("Nonce already exists");
    }

    await ctx.db.insert("nonces", { nonce: args.nonce });
  },
});

export const cleanupOldNonces = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const maxAge = 20 * 60 * 1000;

    const oldNonces = await ctx.db
      .query("nonces")
      .filter((q) => q.lte(q.field("_creationTime"), now - maxAge))
      .collect();

    for (const nonce of oldNonces) {
      await ctx.db.delete(nonce._id);
    }
  },
});
