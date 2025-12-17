import { v } from "convex/values";
import { query } from "./_generated/server";

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
