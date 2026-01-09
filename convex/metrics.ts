import { query } from "./_generated/server";
import { CHAINS_LIST } from "./data/chains";

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.db.query("event_watchers").collect();

    const totalContractsListened = [
      ...new Set(eventWatchers.map((item) => `${item.chain_id}-${item.contract_address}`)),
    ];

    const totalEventsListened = [...new Set(eventWatchers.map((item) => `${item.chain_id}-${item.event_abi}`))];

    return {
      totalChains: CHAINS_LIST.length,
      totalContractsListened: totalContractsListened.length,
      totalEventsListened: totalEventsListened.length,
      totalWatchers: eventWatchers.length,
    };
  },
});
