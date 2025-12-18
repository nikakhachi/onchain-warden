// getter and adder for actions
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const updateTaskLastBlock = mutation({
  args: {
    taskId: v.id("tasks"),
    lastBlock: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.taskId, { last_block: args.lastBlock });
  },
});
