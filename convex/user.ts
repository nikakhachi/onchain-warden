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
      .filter((q) => q.eq(q.field("owner"), getAddress(args.wallet_address)))
      .collect();

    const userTasks: any[] = [];

    for (const eventWatcher of eventWatchers) {
      const ownerIntegrations = await Promise.all(
        eventWatcher.owner_integration_ids.map((item) =>
          ctx.db
            .query("owner_integrations")
            .filter((q) => q.eq(q.field("_id"), item))
            .first()
        )
      );

      const chain = await ctx.db.get(eventWatcher.chain_convex_id);

      userTasks.push({
        eventWatcher,
        ownerIntegrations,
        chain,
      });
    }

    return userTasks;
  },
});
