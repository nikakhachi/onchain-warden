import { ConvexError } from "convex/values";
import { Log, AbiEvent } from "viem";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { ERROR_MESSAGES } from "../errors/errorMessages";
import { checkAgainstConditions } from "../helpers/checkAgainstConditions";
import { handleAlertEvent } from "../helpers/handleAlertEvent";
import { INTEGRATIONS } from "../data/integrations";
import { checkIfComparesToLastEmit } from "../helpers/checkIfComparesToLastEmit";

export const _processEvents = async (
  ctx: ActionCtx,
  eventWatcher: Doc<"event_watchers">,
  events: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>[],
  chainId: number,
  toBlock: bigint,
  addressesMapped: Record<string, string>,
  teamIntegrations: { data: any; _id: Id<"team_integrations">; integration_id: string }[],
) => {
  // setting block number here, because the action might take more,
  // and in the process another cron can run, and setting block number here,
  // avoids duplicate events being processed
  await ctx.runMutation(internal.eventWatchers.updateEventWatcherLastBlock, {
    event_watcher_id: eventWatcher._id,
    last_block: Number(toBlock),
  });

  const filteredEvents = events.filter((event, index) =>
    checkAgainstConditions(event, eventWatcher.condition, index > 0 ? events[index - 1].args : eventWatcher.last_emit),
  );

  const watcherIntegrations = await ctx.runQuery(internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId, {
    event_watcher_id: eventWatcher._id,
  });

  if (checkIfComparesToLastEmit(eventWatcher) && filteredEvents.length) {
    await ctx.runMutation(internal.eventWatchers.writeLastEmit, {
      watcher_id: eventWatcher._id,
      last_emit: filteredEvents[filteredEvents.length - 1].args,
    });
  }

  for (const filteredEvent of filteredEvents) {
    for (const watcherIntegration of watcherIntegrations) {
      const teamIntegration = teamIntegrations.find((t) => t._id === watcherIntegration.team_integration_id);
      if (!teamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);

      const integration = INTEGRATIONS[teamIntegration.integration_id];

      if (!integration) throw new ConvexError(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);

      await handleAlertEvent(
        eventWatcher,
        integration.name as "Telegram" | "Discord" | "Slack",
        teamIntegration.data,
        chainId,
        filteredEvent,
        addressesMapped,
      );
    }
  }
};
