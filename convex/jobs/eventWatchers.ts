import { ActionCtx, internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
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
import { event_watcher_object } from "../schema";
import { getEventName } from "../../src/app/shared/helpers";

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.runQuery(internal.eventWatchers.getActiveEventWatchers);

    const teamAddressesMapped = await ctx.runQuery(internal.teamAddresses.getAllTeamAddressesMapped);
    const integrations = await ctx.runQuery(api.integrations.getIntegrations);
    const teamIntegrations = await ctx.runQuery(internal.teamIntegrations.getAllTeamIntegrations);

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

      const batches: Record<string, Doc<"event_watchers">[]> = {};
      const individuals: Doc<"event_watchers">[] = [];

      for (const eventWatcher of chainIdToEventWatchers[chainId]) {
        if (eventWatcher.condition.some((c) => c.operator === "==" || c.operator === "!=")) {
          individuals.push(eventWatcher);
        } else {
          const key = `${eventWatcher.contract_address}-${eventWatcher.last_block}`;
          if (!batches[key]) batches[key] = [];
          batches[key].push(eventWatcher);
        }
      }

      let delay = 0;
      for (const contractAddress in batches) {
        const teamAddresses = batches[contractAddress].reduce(
          (acc, ew) => {
            acc[ew.team_id] = teamAddressesMapped[ew.team_id];
            return acc;
          },
          {} as Record<Id<"teams">, Record<string, string>>,
        );

        await ctx.scheduler.runAfter(delay, internal.jobs.eventWatchers.processEventWatcherBatch, {
          event_watchers: batches[contractAddress],
          block_number: Number(blockNumber),
          chain_id: Number(chainId),
          team_addresses_mapped: teamAddresses,
          integrations: integrations,
          team_integrations: teamIntegrations,
        });
        delay += 50;
      }

      for (const ew of individuals) {
        await ctx.scheduler.runAfter(delay, internal.jobs.eventWatchers.processEventWatcherIndividual, {
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
  },
});

export const processEventWatcherBatch = internalAction({
  args: {
    event_watchers: v.array(
      v.object({
        ...event_watcher_object,
        _id: v.id("event_watchers"),
        _creationTime: v.number(),
      }),
    ),
    block_number: v.number(),
    chain_id: v.number(),
    team_addresses_mapped: v.record(v.string(), v.record(v.string(), v.string())),
    integrations: v.array(v.object({ name: v.string(), _id: v.id("integrations") })),
    team_integrations: v.array(
      v.object({ data: v.any(), _id: v.id("team_integrations"), integration_id: v.id("integrations") }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      const contractAddress = args.event_watchers[0].contract_address;
      const lastBlock = args.event_watchers[0].last_block;

      // all watchers MUST have same contract address and same last block
      // Sanity checking
      if (
        args.event_watchers.some(
          (watcher) => watcher.contract_address !== contractAddress || watcher.last_block !== lastBlock,
        )
      ) {
        throw new ConvexError("SANITY CHECK FAILED: processEventWatcherBatch");
      }

      const toBlock = BigInt(args.block_number);
      const fromBlock = BigInt(lastBlock + 1);

      const events = await getLogs(
        args.chain_id,
        contractAddress as Address,
        fromBlock,
        toBlock,
        args.event_watchers.map((w) => w.event_abi),
        {},
      );

      await Promise.all(
        args.event_watchers.map(async (eventWatcher) => {
          try {
            const filteredEvents = events.filter((event) => event.eventName === getEventName(eventWatcher.event_abi));
            await _processEvents(
              ctx,
              eventWatcher,
              filteredEvents,
              args.chain_id,
              toBlock,
              args.team_addresses_mapped[eventWatcher.team_id],
              args.integrations,
              args.team_integrations,
            );
          } catch (error) {
            await handleError({
              where: "processEventWatcherBatch await Promise.all",
              error,
              event_watcher_id: eventWatcher._id,
            });
          }
        }),
      );
    } catch (error: any) {
      console.error("ERROR processEventWatcher: ", error);
      await handleError({ where: "processEventWatcherBatch general catch", error });
    }
  },
});

export const processEventWatcherIndividual = internalAction({
  args: {
    event_watcher: v.object({
      ...event_watcher_object,
      _id: v.id("event_watchers"),
      _creationTime: v.number(),
    }),
    block_number: v.number(),
    chain_id: v.number(),
    addresses_mapped: v.record(v.string(), v.string()),
    integrations: v.array(v.object({ name: v.string(), _id: v.id("integrations") })),
    team_integrations: v.array(
      v.object({ data: v.any(), _id: v.id("team_integrations"), integration_id: v.id("integrations") }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      const toBlock = BigInt(args.block_number);
      const fromBlock = BigInt(args.event_watcher.last_block + 1);

      const getLogsConditions: Record<string, string> = {};

      args.event_watcher.condition.forEach((condition) => {
        if (condition.operator === "==") getLogsConditions[condition.field] = condition.value;
      });

      const events = await getLogs(
        args.chain_id,
        args.event_watcher.contract_address as Address,
        fromBlock,
        toBlock,
        [args.event_watcher.event_abi],
        getLogsConditions,
      );

      await _processEvents(
        ctx,
        args.event_watcher,
        events,
        args.chain_id,
        toBlock,
        args.addresses_mapped,
        args.integrations,
        args.team_integrations,
      );
    } catch (error: any) {
      console.error("ERROR processEventWatcher: ", error);
      await handleError({ error, event_watcher_id: args.event_watcher._id });
    }
  },
});

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
