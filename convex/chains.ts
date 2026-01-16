import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const getAllChainsWithLastBlocks = internalQuery({
  handler: async (ctx) => ctx.db.query("chains").collect(),
});

export const updateChainsWithLastBlocks = internalMutation({
  args: {
    chains: v.array(
      v.object({
        chain_id: v.number(),
        last_block: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    for (const chain of args.chains) {
      const chainRecord = await ctx.db
        .query("chains")
        .withIndex("by_chain_id", (q) => q.eq("chain_id", chain.chain_id))
        .unique();

      if (!chainRecord) throw new ConvexError("!chainRecord");

      await ctx.db.patch(chainRecord._id, { last_block: chain.last_block });
    }
  },
});
