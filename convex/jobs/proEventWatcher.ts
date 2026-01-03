import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { CHAIN_ID_TO_VIEM_CLIENT } from "../viem";
import { Id } from "../_generated/dataModel";
import { _mapChainIdToEventWatchers } from "./helpers";

const CREDIT_PER_RUN = 0.000023;

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.runQuery(internal.team.getTeams);
    const teamCredits: Record<Id<"teams">, number> = teams.reduce(
      (acc, team) => {
        acc[team._id] = team.credits;
        return acc;
      },
      {} as Record<Id<"teams">, number>,
    );

    const eventWatchers = await ctx.runQuery(internal.eventWatchers.getProEventWatchers);

    const chainIdToEventWatchers = await _mapChainIdToEventWatchers(ctx, eventWatchers);

    const updatedTeamCredits: Record<Id<"teams">, number> = { ...teamCredits };

    for (const chainId in chainIdToEventWatchers) {
      const blockNumber = await CHAIN_ID_TO_VIEM_CLIENT[chainId].getBlockNumber();

      for (const eventWatcher of chainIdToEventWatchers[chainId]) {
        if (updatedTeamCredits[eventWatcher.team_id] < CREDIT_PER_RUN) continue;

        await ctx.scheduler.runAfter(0, internal.jobs.processEventWatcher.main, {
          event_watcher_id: eventWatcher._id,
          block_number: Number(blockNumber),
          chain_id: Number(chainId),
        });

        updatedTeamCredits[eventWatcher.team_id] -= CREDIT_PER_RUN;
      }
    }

    await ctx.runMutation(internal.team.batchUpdateTeamCredits, {
      data: Object.entries(updatedTeamCredits).map(([teamId, credits]) => ({
        team_id: teamId as Id<"teams">,
        credits,
      })),
    });
  },
});
