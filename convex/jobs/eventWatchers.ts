import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { getBlockNumber } from "../viem";
import { Doc, Id } from "../_generated/dataModel";
import { handleError } from "../errors/handleError";

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const { eventWatchers, teamIntegrations, teamAddressesMapped, watcherIntegrations } = await ctx.runQuery(
        internal.jobs.fetchData.main,
      );

      const chainIdToEw: Record<string, Doc<"event_watchers">[]> = {};

      for (const ew of eventWatchers) {
        const chainId = ew.chain_id!;

        if (!chainIdToEw[chainId]) chainIdToEw[chainId] = [];

        chainIdToEw[chainId].push(ew);
      }

      for (const chainId in chainIdToEw) {
        const blockNumber = await getBlockNumber(Number(chainId));

        const batches: Record<string, Doc<"event_watchers">[]> = {};
        const individuals: Doc<"event_watchers">[] = [];

        const chainEventWatchers = chainIdToEw[chainId];

        for (const eventWatcher of chainEventWatchers) {
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
            team_integrations: teamIntegrations.filter((i) => eventWatchers.some((ew) => ew.team_id === i.team_id)),
            watcher_integrations: watcherIntegrations.filter((i) =>
              eventWatchers.some((ew) => ew._id === i.event_watcher_id),
            ),
          });
          delay += 50;
        }

        for (const ew of individuals) {
          await ctx.scheduler.runAfter(delay, internal.jobs.processEventWatcherIndividual.main, {
            event_watcher: ew,
            block_number: Number(blockNumber),
            chain_id: Number(chainId),
            addresses_mapped: teamAddressesMapped[ew.team_id],
            team_integrations: teamIntegrations.filter((i) => i.team_id === ew.team_id),
            watcher_integrations: watcherIntegrations.filter((i) => i.event_watcher_id === ew._id),
          });
          delay += 50;
        }

        // updateing block numbers here, not waiting for the action, because the action might take long,
        // and in the process another cron can run, and setting block number here,
        // avoids duplicate events being processed
        await ctx.runMutation(internal.eventWatchers.updateLastBlocksOfEventWatchers, {
          event_watcher_ids: chainEventWatchers.map((ew) => ew._id),
          last_block: Number(blockNumber),
        });
      }
    } catch (error) {
      console.error("ERROR eventWatchers: ", error);
      await handleError({ where: "eventWatchers", error });
    }
  },
});
