import { ConvexError } from "convex/values";
import { Log, AbiEvent } from "viem";
import { IntegrationData } from "../../src/app/shared/enums";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { ActionCtx } from "../_generated/server";
import { ERROR_MESSAGES } from "../errors/errorMessages";
import { buildText } from "../helpers/buildText";
import { checkAgainstConditions } from "../helpers/checkAgainstConditions";
import { sendDiscordMessage } from "../integrations/discord";
import { sendSlackMessage } from "../integrations/slack";
import { sendTelegramMessage } from "../integrations/telegram";

export const _processEvents = async (
  ctx: ActionCtx,
  eventWatcher: Doc<"event_watchers">,
  events: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>[],
  chainId: number,
  toBlock: bigint,
  addressesMapped: Record<string, string>,
  integrations: { name: string; _id: Id<"integrations"> }[],
  teamIntegrations: { data: any; _id: Id<"team_integrations">; integration_id: Id<"integrations"> }[],
) => {
  // setting block number here, because the action might take more,
  // and in the process another cron can run, and setting block number here,
  // avoids duplicate events being processed
  await ctx.runMutation(internal.eventWatchers.updateEventWatcherLastBlock, {
    event_watcher_id: eventWatcher._id,
    last_block: Number(toBlock),
  });

  const filteredEvents = events.filter((event) => checkAgainstConditions(event, eventWatcher.condition));

  const watcherIntegrations = await ctx.runQuery(internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId, {
    event_watcher_id: eventWatcher._id,
  });

  for (const filteredEvent of filteredEvents) {
    for (const watcherIntegration of watcherIntegrations) {
      const teamIntegration = teamIntegrations.find((t) => t._id === watcherIntegration.team_integration_id);
      if (!teamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);

      const integration = integrations.find((i) => i._id === teamIntegration.integration_id);
      if (!integration) throw new ConvexError(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);

      const message = buildText(
        integration.name as "Telegram" | "Discord" | "Slack",
        chainId,
        eventWatcher,
        filteredEvent,
        addressesMapped,
      );

      if (integration.name == "Telegram") {
        await sendTelegramMessage(Number(teamIntegration.data[IntegrationData.TELEGRAM]), message);
      } else if (integration.name == "Discord") {
        await sendDiscordMessage(teamIntegration.data[IntegrationData.DISCORD], message);
      } else if (integration.name == "Slack") {
        await sendSlackMessage(teamIntegration.data[IntegrationData.SLACK], message);
      }
    }
  }
};
