import { query } from "./_generated/server";

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    const chains = await ctx.db.query("chains").collect();
    const eventTasks = await ctx.db.query("event_tasks").collect();

    const totalContractsListened = [
      ...new Set(
        eventTasks.map(
          (item) => `${item.chain_convex_id}-${item.contract_address}`
        )
      ),
    ];

    const totalEventsListened = [
      ...new Set(
        eventTasks.map((item) => `${item.chain_convex_id}-${item.event_abi}`)
      ),
    ];

    return {
      totalChains: chains.length,
      totalContractsListened: totalContractsListened.length,
      totalEventsListened: totalEventsListened.length,
      totalTasks: eventTasks.length,
    };
  },
});
