import { ConvexError, v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { getAddress, recoverMessageAddress } from "viem";
import { generateSignature } from "../src/app/helpers";
import { internal } from "./_generated/api";

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
      .withIndex("by_creation_time", (q) =>
        q.lte("_creationTime", now - maxAge)
      )
      .collect();

    for (const nonce of oldNonces) {
      await ctx.db.delete(nonce._id);
    }
  },
});

export const validateSignature = internalAction({
  args: {
    owner: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (args.expiresAt < now) throw new ConvexError("Signature expired");

    const signer = await recoverMessageAddress({
      message: generateSignature(args.nonce, args.expiresAt),
      signature: args.signature as `0x${string}`,
    });

    if (getAddress(signer) !== getAddress(args.owner))
      throw new ConvexError("Invalid signature");

    await ctx.runMutation(internal.nonces.createNonceIfNotExists, {
      nonce: args.nonce,
    });

    return true;
  },
});
