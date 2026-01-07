import { ActionCtx, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { sendTelegramMessage } from "../integrations/telegram";
import { ConvexError, v } from "convex/values";
import { getBlockNumber, getLogs } from "../viem";
import { AbiEvent, Address, Log } from "viem";
import { checkAgainstConditions } from "../helpers/checkAgainstConditions";
import { Doc, Id } from "../_generated/dataModel";
import { buildText } from "../helpers/buildText";
import { sendDiscordMessage } from "../integrations/discord";
import { handleError } from "../errors/handleError";
import { sendSlackMessage } from "../integrations/slack";
import { ERROR_MESSAGES } from "../errors/errorMessages";
import { IntegrationData } from "../../src/app/shared/enums";

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.runQuery(internal.eventWatchers.getActiveEventWatchers);

    const chainConvexIdToChainId: Record<Id<"chains">, number> = {};
    const chainIdToEventWatchers: Record<number, Doc<"event_watchers">[]> = {};

    for (const eventWatcher of eventWatchers) {
      const chainConvexId = eventWatcher.chain_convex_id;
      let chainId = chainConvexIdToChainId[chainConvexId];

      if (!chainId) {
        const chain = await ctx.runQuery(internal.chains.getChainByConvexId, {
          convex_id: chainConvexId,
        });
        if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);
        chainId = chain.chain_id;
        chainConvexIdToChainId[chainConvexId] = chainId;
      }

      if (!chainIdToEventWatchers[chainId]) chainIdToEventWatchers[chainId] = [];

      chainIdToEventWatchers[chainId].push(eventWatcher);
    }

    for (const chainId in chainIdToEventWatchers) {
      const blockNumber = await getBlockNumber(Number(chainId));

      for (let i = 0; i < chainIdToEventWatchers[chainId].length; i++) {
        const eventWatcher = chainIdToEventWatchers[chainId][i];
        await ctx.scheduler.runAfter(i * 50, internal.jobs.eventWatchers.processEventWatcher, {
          event_watcher_id: eventWatcher._id,
          block_number: Number(blockNumber),
          chain_id: Number(chainId),
        });
      }
    }
  },
});

export const processEventWatcher = internalAction({
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

      const toBlock = BigInt(args.block_number);
      const fromBlock = BigInt(eventWatcher.last_block + 1);

      const getLogsConditions: Record<string, string> = {};

      eventWatcher.condition.forEach((condition) => {
        if (condition.operator === "==") getLogsConditions[condition.field] = condition.value;
      });

      const events = await getLogs(
        args.chain_id,
        eventWatcher.contract_address as Address,
        fromBlock,
        toBlock,
        eventWatcher.event_abi,
        getLogsConditions,
      );

      await _processEvents(ctx, eventWatcher, events, args.chain_id, toBlock);
    } catch (error: any) {
      console.error("ERROR processEventWatcher: ", error);
      await handleError({ error, event_watcher_id: args.event_watcher_id });
    }
  },
});

export const _processEvents = async (
  ctx: ActionCtx,
  eventWatcher: Doc<"event_watchers">,
  events: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>[],
  chainId: number,
  toBlock: bigint,
) => {
  const teamAddressesMapped = await ctx.runQuery(internal.teamAddresses.getAllTeamAddressesMapped);

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

  const watcherIntegrations = await ctx.runQuery(internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId, {
    event_watcher_id: eventWatcher._id,
  });

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
        chainId,
        eventWatcher,
        filteredEvent,
        teamAddressesMapped[eventWatcher.team_id],
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
