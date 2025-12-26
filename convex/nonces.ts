import { ConvexError, v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { SIGNATURE_EXPIRATION_TIME } from "../src/app/constants";

export const createNonceIfNotExists = internalMutation({
  args: { nonce: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("nonces")
      .withIndex("by_nonce", (q) => q.eq("nonce", args.nonce))
      .unique();

    if (existing) throw new ConvexError("Nonce already exists");

    await ctx.db.insert("nonces", { nonce: args.nonce });
  },
});

export const cleanupOldNonces = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();

    // Remove nonce that is older than the signature expiration time + 5 seconds
    // After this time, the signature is no longer valid, because of the expiration time
    const maxAge = SIGNATURE_EXPIRATION_TIME + 5 * 1000;

    const oldNonces = await ctx.db
      .query("nonces")
      .withIndex("by_creation_time", (q) => q.lte("_creationTime", now - maxAge))
      .collect();

    await Promise.all(oldNonces.map((nonce) => ctx.db.delete(nonce._id)));
  },
});
