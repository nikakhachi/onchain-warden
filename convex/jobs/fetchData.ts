import { getAddress } from "viem";
import { internalQuery } from "../_generated/server";

export const main = internalQuery({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.db
      .query("event_watchers")
      .withIndex("by_is_active", (q) => q.eq("is_active", true))
      .collect();

    const teamIntegrations = await ctx.db.query("team_integrations").collect();

    const watcherIntegrations = await ctx.db.query("watcher_integrations").collect();

    const teamAddresses = await ctx.db.query("team_addresses").collect();

    const teamAddressesMapped: Record<string, Record<string, string>> = {};

    teamAddresses.forEach((item) => {
      if (!teamAddressesMapped[item.team_id]) teamAddressesMapped[item.team_id] = {};

      teamAddressesMapped[item.team_id][getAddress(item.address)] = item.label;
    });

    return { eventWatchers, teamIntegrations, teamAddressesMapped, watcherIntegrations };
  },
});
