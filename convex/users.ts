import { ConvexError, v } from "convex/values";
import { action, internalMutation, internalQuery, mutation } from "./_generated/server";
import { getAddress } from "viem";
import { internal } from "./_generated/api";
import { _mustBeAuthenticated } from "./auth";
import { plans } from "../src/app/shared/plans";
import { Doc } from "./_generated/dataModel";

export const authenticateOrCreateUserWithWallet = action({
  args: {
    wallet_address: v.string(),
    username: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args) => {
    const formattedWalletAddress = getAddress(args.wallet_address);

    await ctx.runAction(internal.auth_node.verifySignature, {
      owner: formattedWalletAddress,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    });

    const existingUser = await ctx.runQuery(internal.users.getExistingUserByWalletAddress, {
      wallet_address: formattedWalletAddress,
    });

    if (!existingUser) {
      await ctx.runMutation(internal.users.createUserAndTeam, {
        wallet_address: formattedWalletAddress,
        username: args.username,
        email: undefined,
      });
    }

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
    paddle_customer_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user_id = await ctx.db.insert("users", {
      wallet_address: args.wallet_address,
      email: args.email,
      username: args.username,
      paddle_customer_id: args.paddle_customer_id,
    });
    const team_id = await ctx.db.insert("teams", { name: "Personal Workspace", is_personal: true, alert_limit: 5 });
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

    const formattedEmail = args.email.toLowerCase();

    const existingUser = await ctx.runQuery(internal.users.getExistingUserByEmail, {
      email: formattedEmail,
    });

    if (!existingUser) {
      await ctx.runMutation(internal.users.createUserAndTeam, {
        email: formattedEmail,
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
      email: formattedEmail,
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

export const deleteUser = mutation({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    const members = await ctx.db
      .query("team_members")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    const ownerInstances = members.filter((member) => member.role === "owner");
    const nonOwnerInstances = members.filter((member) => member.role !== "owner");

    await Promise.all(nonOwnerInstances.map((member) => ctx.db.delete(member._id)));

    await Promise.all(
      ownerInstances.map((member) => ctx.runMutation(internal.team.deleteTeamInternal, { team_id: member.team_id })),
    );

    const accessTokens = await ctx.db
      .query("access_tokens")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    await Promise.all(accessTokens.map((token) => ctx.db.delete(token._id)));

    await ctx.db.delete(user._id);
  },
});

export const createPaddleCustomer = internalMutation({
  args: {
    email: v.string(),
    paddle_customer_id: v.string(),
  },
  handler: async (ctx, args) => {
    const formattedEmail = args.email.toLowerCase();

    const existingUser = await ctx.runQuery(internal.users.getExistingUserByEmail, { email: formattedEmail });

    if (!existingUser) {
      await ctx.runMutation(internal.users.createUserAndTeam, {
        email: formattedEmail,
        username: formattedEmail.split("@")[0],
        wallet_address: undefined,
        paddle_customer_id: args.paddle_customer_id,
      });

      return true;
    }

    await ctx.db.patch(existingUser._id, { paddle_customer_id: args.paddle_customer_id });
  },
});

export const subscribeToPaddlePlan = internalMutation({
  args: {
    paddle_customer_id: v.string(),
    paddle_price_id: v.string(),
    email: v.optional(v.string()),
    walletAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const plan = plans.find(
      (plan) => plan.monthlyPriceId === args.paddle_price_id || plan.annualPriceId === args.paddle_price_id,
    );
    if (!plan) throw new ConvexError("Plan not found");

    let existingUser: Doc<"users"> | null = null;

    if (args.email) {
      existingUser = await ctx.runQuery(internal.users.getExistingUserByEmail, { email: args.email });
    } else if (args.walletAddress) {
      existingUser = await ctx.runQuery(internal.users.getExistingUserByWalletAddress, {
        wallet_address: args.walletAddress,
      });
    } else {
      throw new ConvexError(`Email or wallet address is required: ${JSON.stringify(args)}`);
    }

    if (!existingUser) throw new ConvexError("User not found");

    await ctx.db.patch(existingUser._id, { paddle_customer_id: args.paddle_customer_id });

    if (plan.title === "Solo") {
      const personalTeam = await ctx.runQuery(internal.team.getPersonalTeamByUserId, { user_id: existingUser._id });

      await ctx.db.patch(personalTeam._id, { alert_limit: plan.alerts });
    } else if (plan.title === "Team") {
      await ctx.runMutation(internal.team.createPremiumTeam, { user_id: existingUser._id });
    } else {
      throw new ConvexError(`Plan not found for price id: ${args.paddle_price_id}`);
    }
  },
});
