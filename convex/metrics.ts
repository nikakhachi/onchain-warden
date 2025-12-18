import { query } from "./_generated/server";
import { v } from "convex/values";

export const getMetrics = query({
  args: {},
  handler: async (ctx) => {
    const chains = await ctx.db.query("chains").collect();
    const tasks = await ctx.db.query("tasks").collect();

    const eventSubscriptions = await ctx.db
      .query("event_subscriptions")
      .collect();

    const totalContractsListened = [
      ...new Set(
        eventSubscriptions.map(
          (item) => `${item.chain}-${item.contract_address}`
        )
      ),
    ];

    const totalEventsListened = [
      ...new Set(
        eventSubscriptions.map((item) => `${item.chain}-${item.event_abi}`)
      ),
    ];

    return {
      totalChains: chains.length,
      totalContractsListened: totalContractsListened.length,
      totalEventsListened: totalEventsListened.length,
      totalTasks: tasks.length,
    };
  },
});
