import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { ConvexError } from "convex/values";
import { getBlockNumber } from "../viem";
import { Doc, Id } from "../_generated/dataModel";
import { ERROR_MESSAGES } from "../errors/errorMessages";
import { handleError } from "../errors/handleError";

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const eventWatchers = await ctx.runQuery(internal.eventWatchers.getActiveEventWatchers);
      const integrations = await ctx.runQuery(api.integrations.getIntegrations);
      const teamIntegrations = await ctx.runQuery(internal.teamIntegrations.getAllTeamIntegrations);
      const teamAddressesMapped = await ctx.runQuery(internal.teamAddresses.getAllTeamAddressesMapped);

      const ccidToEw: Record<Id<"chains">, Doc<"event_watchers">[]> = {};

      for (const ew of eventWatchers) {
        if (!ccidToEw[ew.chain_convex_id]) ccidToEw[ew.chain_convex_id] = [];

        ccidToEw[ew.chain_convex_id].push(ew);
      }

      for (const ccid in ccidToEw) {
        const chain = await ctx.runQuery(internal.chains.getChainByConvexId, { convex_id: ccid as Id<"chains"> });
        if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);

        const chainId = chain.chain_id;

        const blockNumber = await getBlockNumber(Number(chainId));

        const batches: Record<string, Doc<"event_watchers">[]> = {};
        const individuals: Doc<"event_watchers">[] = [];

        for (const eventWatcher of ccidToEw[ccid as Id<"chains">]) {
          if (eventWatcher.condition.some((c) => c.operator === "==")) {
            individuals.push(eventWatcher);
          } else {
            const key = `${eventWatcher.contract_address}-${eventWatcher.last_block}`;
            if (!batches[key]) batches[key] = [];
            batches[key].push(eventWatcher);
          }
        }

        let delay = 0;

        for (const contractAddress in batches) {
          const eventWatchers = batches[contractAddress];

          const teamAddresses = eventWatchers.reduce(
            (acc, ew) => {
              acc[ew.team_id] = teamAddressesMapped[ew.team_id];
              return acc;
            },
            {} as Record<Id<"teams">, Record<string, string>>,
          );

          await ctx.scheduler.runAfter(delay, internal.jobs.processEventWatchersBatched.main, {
            event_watchers: eventWatchers,
            block_number: Number(blockNumber),
            chain_id: Number(chainId),
            team_addresses_mapped: teamAddresses,
            integrations: integrations,
            team_integrations: teamIntegrations.filter((i) => eventWatchers.some((ew) => ew.team_id === i.team_id)),
          });
          delay += 50;
        }

        for (const ew of individuals) {
          await ctx.scheduler.runAfter(delay, internal.jobs.processEventWatcherIndividual.main, {
            event_watcher: ew,
            block_number: Number(blockNumber),
            chain_id: Number(chainId),
            addresses_mapped: teamAddressesMapped[ew.team_id],
            integrations: integrations,
            team_integrations: teamIntegrations.filter((i) => i.team_id === ew.team_id),
          });
          delay += 50;
        }
      }
    } catch (error) {
      console.error("ERROR eventWatchers: ", error);
      await handleError({ where: "eventWatchers", error });
    }
  },
});
