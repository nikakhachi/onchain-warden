// getter and adder for actions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getActions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("actions").collect();
  },
});

export const updateActionLastBlock = mutation({
  args: {
    actionId: v.id("actions"),
    lastBlock: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.actionId, { last_block: args.lastBlock });
  },
});
