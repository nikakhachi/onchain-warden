import { ConvexError, v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { getAddress } from "viem";
import { internal } from "./_generated/api";
import { _mustBeAuthenticated } from "./auth";
import { ERROR_MESSAGES } from "./errors/errorMessages";

export const createUser = action({
  args: {
    wallet_address: v.string(),
    username: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args) => {
    const formattedWalletAddress = getAddress(args.wallet_address);

    const existingUser = await ctx.runQuery(internal.users.getExistingUserByWalletAddress, {
      wallet_address: formattedWalletAddress,
    });

    if (existingUser) throw new ConvexError(ERROR_MESSAGES.USER_ALREADY_EXISTS);

    await ctx.runAction(internal.auth_node.verifySignature, {
      owner: formattedWalletAddress,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    });

    await ctx.runMutation(internal.users.createUserAndTeam, {
      wallet_address: formattedWalletAddress,
      username: args.username,
      email: undefined,
    });

    const { token, expiresAt } = (await ctx.runAction(internal.auth_node.generateToken)) as {
      token: string;
      expiresAt: number;
    };

    await ctx.runMutation(internal.auth.createAccessToken, {
      token,
      owner: formattedWalletAddress,
      expires_at: expiresAt,
      created_at: Date.now(),
    });

    return {
      accessToken: token,
      expiresAt: expiresAt,
    };
  },
});

export const getExistingUserByWalletAddress = internalQuery({
  args: { wallet_address: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("users")
      .withIndex("by_wallet_address", (q) => q.eq("wallet_address", args.wallet_address))
      .unique(),
});

export const getExistingUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique(),
});

export const createUserAndTeam = internalMutation({
  args: {
    wallet_address: v.optional(v.string()),
    email: v.optional(v.string()),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const user_id = await ctx.db.insert("users", {
      wallet_address: args.wallet_address,
      email: args.email,
      username: args.username,
    });
    const team_id = await ctx.db.insert("teams", { name: "My Team" });
    await ctx.db.insert("team_members", { team_id, user_id, role: "owner", added_by: user_id });

    return { user_id, team_id };
  },
});

export const authenticateOrCreateUserWithEmail = action({
  args: {
    email: v.string(),
    username: v.string(),
    jwt_token: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.runAction(internal.auth_node.verifyGmailToken, { jwt_token: args.jwt_token, email: args.email });

    const existingUser = await ctx.runQuery(internal.users.getExistingUserByEmail, {
      email: args.email,
    });

    if (!existingUser) {
      await ctx.runMutation(internal.users.createUserAndTeam, {
        email: args.email,
        username: args.username,
        wallet_address: undefined,
      });
    }

    const { token, expiresAt } = (await ctx.runAction(internal.auth_node.generateToken)) as {
      token: string;
      expiresAt: number;
    };

    await ctx.runMutation(internal.auth.createAccessTokenByEmail, {
      token,
      email: args.email,
      expires_at: expiresAt,
      created_at: Date.now(),
    });

    return {
      accessToken: token,
      expiresAt: expiresAt,
    };
  },
});

export const updateUser = mutation({
  args: { username: v.string(), accessToken: v.string() },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    return await ctx.db.patch(user._id, { username: args.username });
  },
});
