import { v } from "convex/values";
import { query } from "./_generated/server";
import { getAddress } from "viem";

export const getUsersEventWatchers = query({
  args: {
    wallet_address: v.string(),
  },
  handler: async (ctx, args) => {
    const eventWatchers = await ctx.db
      .query("event_watchers")
      .withIndex("by_owner", (q) =>
        q.eq("owner", getAddress(args.wallet_address))
      )
      .collect();

    const userTasks: any[] = [];

    for (const eventWatcher of eventWatchers) {
      const ownerIntegrations = (
        await Promise.all(
          eventWatcher.owner_integration_ids.map((item) =>
            ctx.db
              .query("owner_integrations")
              .withIndex("by_id", (q) => q.eq("_id", item))
              .unique()
          )
        )
      ).filter((item) => item !== null);

      const integrations = await Promise.all(
        ownerIntegrations.map((item) => ctx.db.get(item.integration_id))
      );

      const integrations_data = ownerIntegrations.map((item, index) => ({
        ownerIntegration: item,
        integration: integrations[index],
      }));

      const chain = await ctx.db.get(eventWatcher.chain_convex_id);

      userTasks.push({
        eventWatcher,
        integrations_data,
        chain,
      });
    }

    return userTasks;
  },
});
