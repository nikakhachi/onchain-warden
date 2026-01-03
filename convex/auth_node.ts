"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { getAddress, recoverMessageAddress } from "viem";
import { generateSignature } from "../src/app/helpers";
import { internal } from "./_generated/api";
import crypto from "crypto";
import { ACCESS_TOKEN_EXPIRATION_TIME } from "../src/app/constants";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { jwtVerify, createRemoteJWKSet } from "jose";

const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_JWKS = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

export const authenticate = action({
  args: {
    owner: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.auth_node.verifySignature, {
      owner: args.owner,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    });

    const { token, expiresAt } = (await ctx.runAction(internal.auth_node.generateToken)) as {
      token: string;
      expiresAt: number;
    };

    await ctx.runMutation(internal.auth.createAccessToken, {
      token,
      owner: getAddress(args.owner),
      expires_at: expiresAt,
      created_at: Date.now(),
    });

    return {
      accessToken: token,
      expiresAt: expiresAt,
    };
  },
});

export const verifySignature = internalAction({
  args: {
    owner: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (args.expiresAt < now) throw new ConvexError(ERROR_MESSAGES.SIGNATURE_EXPIRED);

    const signer = await recoverMessageAddress({
      message: generateSignature(args.nonce, args.expiresAt),
      signature: args.signature as `0x${string}`,
    });

    if (getAddress(signer) !== getAddress(args.owner)) {
      throw new ConvexError(ERROR_MESSAGES.INVALID_SIGNATURE);
    }

    await ctx.runMutation(internal.nonces.createNonceIfNotExists, {
      nonce: args.nonce,
    });

    return true;
  },
});

export const verifyGmailToken = internalAction({
  args: {
    jwt_token: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { payload } = await jwtVerify(args.jwt_token, GOOGLE_JWKS);

    if (payload.email !== args.email) throw new ConvexError(ERROR_MESSAGES.INVALID_TOKEN);

    return true;
  },
});

export const generateToken = internalAction({
  args: {},
  handler: async () => {
    const token = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = Date.now() + ACCESS_TOKEN_EXPIRATION_TIME;

    return { token, expiresAt: tokenExpiresAt };
  },
});
