import { query } from "./_generated/server";
import { v } from "convex/values";

export const getAvailableActions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("available_actions").collect();
  },
});

export const getAvailableActionById = query({
  args: {
    id: v.id("available_actions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
