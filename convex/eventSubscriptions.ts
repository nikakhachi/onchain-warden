import { ConvexError, v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { parseAbiItem } from "viem";

export const getEventSubscriptions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("event_subscriptions").collect();
  },
});

export const getEventSubscriptionById = query({
  args: {
    id: v.id("event_subscriptions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createEventSubscription = internalMutation({
  args: {
    chain_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      parseAbiItem(args.event_abi);
    } catch (error) {
      throw new ConvexError(`Invalid ABI event`);
    }

    const newEventSubscription = await ctx.db.insert("event_subscriptions", {
      chain: args.chain_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
    });

    return newEventSubscription;
  },
});
