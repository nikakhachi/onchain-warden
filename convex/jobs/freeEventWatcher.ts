import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { CHAIN_ID_TO_VIEM_CLIENT } from "../viem";

import { _mapChainIdToEventWatchers } from "./helpers";

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.runQuery(internal.eventWatchers.getFreeEventWatchers);

    const chainIdToEventWatchers = await _mapChainIdToEventWatchers(ctx, eventWatchers);

    for (const chainId in chainIdToEventWatchers) {
      const blockNumber = await CHAIN_ID_TO_VIEM_CLIENT[chainId].getBlockNumber();

      for (const eventWatcher of chainIdToEventWatchers[chainId]) {
        await ctx.scheduler.runAfter(0, internal.jobs.processEventWatcher.main, {
          event_watcher_id: eventWatcher._id,
          block_number: Number(blockNumber),
          chain_id: Number(chainId),
        });
      }
    }
  },
});
