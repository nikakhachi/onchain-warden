import { query } from "./_generated/server";
import { v } from "convex/values";

export const getChains = query({
  args: {},
  handler: async (ctx) => ctx.db.query("chains").collect(),
});

export const getChainByConvexId = query({
  args: {
    convex_id: v.id("chains"),
  },
  handler: async (ctx, args) => ctx.db.get(args.convex_id),
});

export const getChainByName = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("chains")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .unique(),
});

export const getChainByChainId = query({
  args: {
    chainId: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db
      .query("chains")
      .withIndex("by_chain_id", (q) => q.eq("chain_id", args.chainId))
      .unique(),
});
