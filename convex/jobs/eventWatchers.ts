import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { getBlockNumber } from "../viem";
import { Doc, Id } from "../_generated/dataModel";
import { handleError } from "../errors/handleError";
import { ConvexError } from "convex/values";

// block number handling
// this function will run every minute, and even if theres no event watchers,
// last block number will be called and stored in the db
// this function allows all event watchers per chain to be run without need of their individual blocks
// CONSIDERATION:
// If event watcher is activated, then yes, the next monitoring for watcher will include <1min in past
// When new event watcher is added, the next monitoring of that watcher will include <1min in past
// This is not a problem
// This architecture avoids lots of last_block writes, which took THE MOST function calls in convex

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    const chainsWithNewLastBlocks: Record<number, number> = {};

    try {
      const eventWatchers = await ctx.runQuery(internal.eventWatchers.getActiveEventWatchers_1m);
      const teamIntegrations = await ctx.runQuery(internal.teamIntegrations.getAllTeamIntegrations);
      const teamAddressesMapped = await ctx.runQuery(internal.teamAddresses.getAllTeamAddressesMapped);
      const chainsToLastBlocks = await ctx.runQuery(internal.chains.getAllChainsWithLastBlocks);

      const chainIdToEw: Record<number, Doc<"event_watchers">[]> = chainsToLastBlocks.reduce(
        (acc, item) => ({
          ...acc,
          [item.chain_id]: [],
        }),
        {},
      );

      for (const ew of eventWatchers) {
        const chainId = ew.chain_id!;

        if (!chainIdToEw[chainId]) throw new ConvexError("!chainIdToEw[chainId]");

        chainIdToEw[chainId].push(ew);
      }

      for (const chainId in chainIdToEw) {
        const toBlock = Number(await getBlockNumber(Number(chainId)));
        const fromBlock = chainsToLastBlocks.find((item) => item.chain_id === chainid).last_block;

        chainsWithNewLastBlocks[Number(chainId)] = toBlock;

        const batches: Record<string, Doc<"event_watchers">[]> = {};
        const individuals: Doc<"event_watchers">[] = [];

        for (const eventWatcher of chainIdToEw[chainId]) {
          if (eventWatcher.condition.some((c) => c.operator === "==")) {
            individuals.push(eventWatcher);
          } else {
            const key = `${eventWatcher.contract_address}`;
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
            to_block: toBlock,
            from_block: fromBlock,
            chain_id: Number(chainId),
            team_addresses_mapped: teamAddresses,
            team_integrations: teamIntegrations.filter((i) => eventWatchers.some((ew) => ew.team_id === i.team_id)),
          });
          delay += 50;
        }

        for (const ew of individuals) {
          await ctx.scheduler.runAfter(delay, internal.jobs.processEventWatcherIndividual.main, {
            event_watcher: ew,
            to_block: toBlock,
            from_block: fromBlock,
            chain_id: Number(chainId),
            addresses_mapped: teamAddressesMapped[ew.team_id],
            team_integrations: teamIntegrations.filter((i) => i.team_id === ew.team_id),
          });
          delay += 50;
        }
      }
    } catch (error) {
      console.error("ERROR eventWatchers: ", error);
      await handleError({ where: "eventWatchers", error });
    } finally {
      await ctx.runMutation(internal.chains.updateChainsWithLastBlocks, {
        chains: Object.keys(chainsWithNewLastBlocks).map((item) => ({
          chain_id: Number(item),
          last_block: chainsWithNewLastBlocks[Number(item)],
        })),
      });
    }
  },
});
