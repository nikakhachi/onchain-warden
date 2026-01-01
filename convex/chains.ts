import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const getChains = query({
  args: {},
  handler: async (ctx) => ctx.db.query("chains").collect(),
});

export const getChainByConvexId = internalQuery({
  args: {
    convex_id: v.id("chains"),
  },
  handler: async (ctx, args) => ctx.db.get(args.convex_id),
});
