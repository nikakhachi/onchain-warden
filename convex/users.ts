import { ConvexError, v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { getAddress } from "viem";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

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

    if (existingUser) throw new ConvexError("User already exists");

    const authResult = (await ctx.runAction(api.auth_node.authenticate, {
      owner: args.wallet_address,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    })) as { accessToken: string; expiresAt: number };

    await ctx.runMutation(internal.users.createUserAndTeam, {
      wallet_address: formattedWalletAddress,
      username: args.username,
    });

    return authResult;
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

export const createUserAndTeam = internalMutation({
  args: { wallet_address: v.string(), username: v.string() },
  handler: async (ctx, args) => {
    const user_id = await ctx.db.insert("users", { wallet_address: args.wallet_address, username: args.username });
    const team_id = await ctx.db.insert("teams", { name: "My Team", owner_user_id: user_id });

    return { user_id, team_id };
  },
});

export const updateUser = mutation({
  args: { username: v.string(), accessToken: v.string() },
  handler: async (ctx, args) => {
    const user = (await ctx.runMutation(api.auth.validateToken, { token: args.accessToken })) as Doc<"users">;

    return await ctx.db.patch(user._id, { username: args.username });
  },
});
