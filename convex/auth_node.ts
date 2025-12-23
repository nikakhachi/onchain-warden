"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAddress, recoverMessageAddress } from "viem";
import { generateSignature } from "../src/app/helpers";
import { internal } from "./_generated/api";
import crypto from "crypto";
import { ACCESS_TOKEN_EXPIRATION_TIME } from "../src/app/constants";

export const authenticate = action({
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

    if (getAddress(signer) !== getAddress(args.owner)) {
      throw new ConvexError("Invalid signature");
    }

    // Validate and store nonce to prevent reuse
    await ctx.runMutation(internal.nonces.createNonceIfNotExists, {
      nonce: args.nonce,
    });

    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = Date.now() + ACCESS_TOKEN_EXPIRATION_TIME;

    await ctx.runMutation(internal.auth.createAccessToken, {
      token,
      owner: getAddress(args.owner),
      expires_at: tokenExpiresAt,
      created_at: Date.now(),
    });

    return {
      accessToken: token,
      expiresAt: tokenExpiresAt,
    };
  },
});
