import { query } from "./_generated/server";

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    const chains = await ctx.db.query("chains").collect();
    const eventWatchers = await ctx.db.query("event_watchers").collect();

    const totalContractsListened = [
      ...new Set(eventWatchers.map((item) => `${item.chain_convex_id}-${item.contract_address}`)),
    ];

    const totalEventsListened = [...new Set(eventWatchers.map((item) => `${item.chain_convex_id}-${item.event_abi}`))];

    return {
      totalChains: chains.length,
      totalContractsListened: totalContractsListened.length,
      totalEventsListened: totalEventsListened.length,
      totalWatchers: eventWatchers.length,
    };
  },
});
