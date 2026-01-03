import { ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const _mapChainIdToEventWatchers = async (ctx: ActionCtx, eventWatchers: Doc<"event_watchers">[]) => {
  const chainConvexIdToChainId: Record<Id<"chains">, number> = {};
  const chainIdToEventWatchers: Record<number, Doc<"event_watchers">[]> = {};

  for (const eventWatcher of eventWatchers) {
    const chainConvexId = eventWatcher.chain_convex_id;
    let chainId = chainConvexIdToChainId[chainConvexId];

    if (!chainId) {
      const chain = await ctx.runQuery(internal.chains.getChainByConvexId, {
        convex_id: chainConvexId,
      });
      if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);
      chainId = chain.chain_id;
      chainConvexIdToChainId[chainConvexId] = chainId;
    }

    if (!chainIdToEventWatchers[chainId]) chainIdToEventWatchers[chainId] = [];

    chainIdToEventWatchers[chainId].push(eventWatcher);
  }

  return chainIdToEventWatchers;
};
