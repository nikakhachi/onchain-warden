import { Address } from "viem";
import { v, ConvexError } from "convex/values";
import { parseAbiItem, AbiEvent } from "viem";
import { IntegrationData } from "../../src/app/enums";
import { internal } from "../_generated/api";
import { Id, Doc } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";
import { ERROR_MESSAGES } from "../errors/errorMessages";
import { handleError } from "../errors/handleError";
import { buildText } from "../helpers/buildText";
import { checkAgainstConditions } from "../helpers/checkAgainstConditions";
import { sendDiscordMessage } from "../integrations/discord";
import { sendSlackMessage } from "../integrations/slack";
import { sendTelegramMessage } from "../integrations/telegram";
import { CHAIN_ID_TO_VIEM_CLIENT } from "../viem";

export const main = internalAction({
  args: {
    event_watcher_id: v.id("event_watchers"),
    block_number: v.number(),
    chain_id: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const eventWatcher = await ctx.runQuery(internal.eventWatchers.getEventWatcherById, {
        id: args.event_watcher_id,
      });

      if (!eventWatcher) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_NULL);

      const viemClient = CHAIN_ID_TO_VIEM_CLIENT[args.chain_id];

      const teamAddressesMapped = await ctx.runQuery(internal.teamAddresses.getAllTeamAddressesMapped);

      const toBlock = BigInt(args.block_number);
      const fromBlock = BigInt(eventWatcher.last_block + 1);

      const getLogsConditions: Record<string, string> = {};

      eventWatcher.condition.forEach((condition) => {
        if (condition.operator === "==") getLogsConditions[condition.field] = condition.value;
      });

      const events = await viemClient.getLogs({
        address: eventWatcher.contract_address as Address,
        fromBlock,
        toBlock,
        event: parseAbiItem(eventWatcher.event_abi) as AbiEvent,
        args: getLogsConditions,
      });

      // setting block number here, because the action might take more,
      // and in the process another cron can run, and setting block number here,
      // avoids duplicate events being processed
      await ctx.runMutation(internal.eventWatchers.updateEventWatcherLastBlock, {
        event_watcher_id: eventWatcher._id,
        last_block: Number(toBlock),
      });

      // cache
      let teamIntegrationMap = new Map<Id<"team_integrations">, Doc<"team_integrations">>();
      let integrationMap = new Map<Id<"integrations">, Doc<"integrations">>();

      const filteredEvents = events.filter((event) => checkAgainstConditions(event, eventWatcher.condition));

      // const blockSecondsQueried =
      //   (Number(toBlock) - Number(fromBlock)) *
      //   CHAIN_ID_TO_BLOCK_SECONDS[chain.chain_id];

      // if (blockSecondsQueried / filteredEvents.length <= 3)
      //   throw new ConvexError(`blockSecondsQueried / filteredEvents.length <= 3`);

      const watcherIntegrations = await ctx.runQuery(
        internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId,
        {
          event_watcher_id: eventWatcher._id,
        },
      );

      for (const filteredEvent of filteredEvents) {
        for (const watcherIntegration of watcherIntegrations) {
          let teamIntegration = teamIntegrationMap.get(watcherIntegration.team_integration_id);

          if (!teamIntegration) {
            const _teamIntegration = await ctx.runQuery(internal.teamIntegrations.getTeamIntegrationById, {
              id: watcherIntegration.team_integration_id,
            });

            if (!_teamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);

            teamIntegration = _teamIntegration;
            teamIntegrationMap.set(watcherIntegration.team_integration_id, teamIntegration);
          }

          let integration = integrationMap.get(teamIntegration.integration_id);

          if (!integration) {
            const _integration = await ctx.runQuery(internal.integrations.getIntegrationById, {
              id: teamIntegration.integration_id,
            });

            if (!_integration) throw new ConvexError(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);

            integration = _integration;
            integrationMap.set(teamIntegration.integration_id, integration);
          }

          const message = buildText(
            integration.name as "Telegram" | "Discord" | "Slack",
            args.chain_id,
            eventWatcher,
            filteredEvent,
            teamAddressesMapped[eventWatcher.team_id],
          );

          if (integration.name == "Telegram") {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await sendTelegramMessage(Number(teamIntegration.data[IntegrationData.TELEGRAM]), message);
          } else if (integration.name == "Discord") {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await sendDiscordMessage(teamIntegration.data[IntegrationData.DISCORD], message);
          } else if (integration.name == "Slack") {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            await sendSlackMessage(teamIntegration.data[IntegrationData.SLACK], message);
          }
        }
      }
    } catch (error: any) {
      await handleError({ error, event_watcher_id: args.event_watcher_id });
    }
  },
});
