import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTaskDefinitions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("task_definitions").collect();
  },
});

export const getTaskDefinitionById = query({
  args: {
    id: v.id("task_definitions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});
