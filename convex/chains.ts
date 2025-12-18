// getter and adder for chains
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getChains = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("chains").collect();
  },
});

export const getChainByConvexId = query({
  args: {
    convex_id: v.id("chains"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.convex_id);
  },
});

export const getChainByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chains")
      .filter((q) => q.eq(q.field("name"), args.name))
      .unique();
  },
});

export const getChainByChainId = query({
  args: {
    chainId: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chains")
      .filter((q) => q.eq(q.field("chain_id"), args.chainId))
      .unique();
  },
});
