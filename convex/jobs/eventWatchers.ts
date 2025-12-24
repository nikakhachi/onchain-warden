import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import { sendTelegramMessage } from "../integrations/telegram";
import { ConvexError, v } from "convex/values";
import { CHAIN_ID_TO_VIEM_CLIENT } from "../viem";
import { AbiEvent, Address, getAddress, parseAbiItem } from "viem";
import { checkAgainstConditions } from "../helpers/checkAgainstConditions";
import { Doc, Id } from "../_generated/dataModel";

export const main = internalAction({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.runQuery(
      internal.eventWatchers.getEventWatchers
    );

    for (const eventWatcher of eventWatchers) {
      await ctx.scheduler.runAfter(
        0,
        internal.jobs.eventWatchers.processEventWatcher,
        { event_watcher_id: eventWatcher._id }
      );
    }
  },
});

export const processEventWatcher = internalAction({
  args: {
    event_watcher_id: v.id("event_watchers"),
  },
  handler: async (ctx, args) => {
    const eventWatcher = await ctx.runQuery(
      internal.eventWatchers.getEventWatcherByIdInternal,
      { id: args.event_watcher_id }
    );

    if (!eventWatcher) {
      console.log(`Event watcher ${args.event_watcher_id} not found, skipping`);
      return;
    }

    const ownerAddressesMapped = await ctx.runQuery(
      internal.ownerAddresses.getAllOwnerAddressesMapped
    );

    const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
      convex_id: eventWatcher.chain_convex_id,
    });

    if (!chain) throw new ConvexError("Chain not found");

    const viemClient = CHAIN_ID_TO_VIEM_CLIENT[chain.chain_id];

    const currentBlock = await viemClient.getBlockNumber();

    const getLogsConditions: Record<string, string> = {};

    eventWatcher.condition.forEach((condition) => {
      if (condition.operator === "==")
        getLogsConditions[condition.field] = condition.value;
    });

    const events = await viemClient.getLogs({
      address: eventWatcher.contract_address as Address,
      fromBlock: BigInt(eventWatcher.last_block + 1),
      toBlock: currentBlock,
      event: parseAbiItem(eventWatcher.event_abi) as AbiEvent,
      args: getLogsConditions,
    });

    // setting block number here, because the action might take more,
    // and in the process another cron can run, and setting block number here,
    // avoids duplicate events being processed
    await ctx.runMutation(internal.eventWatchers.updateEventWatcherLastBlock, {
      event_watcher_id: eventWatcher._id,
      last_block: Number(currentBlock),
    });

    // cache
    let ownerIntegrationMap = new Map<
      Id<"owner_integrations">,
      Doc<"owner_integrations">
    >();
    let integrationMap = new Map<Id<"integrations">, Doc<"integrations">>();

    for (const event of events) {
      if (!checkAgainstConditions(event, eventWatcher.condition)) continue;
      for (const ownerIntegrationId of eventWatcher.owner_integration_ids) {
        let ownerIntegration = ownerIntegrationMap.get(ownerIntegrationId);

        if (!ownerIntegration) {
          const _ownerIntegration = await ctx.runQuery(
            api.ownerIntegrations.getOwnerIntegrationById,
            {
              id: ownerIntegrationId,
            }
          );

          if (!_ownerIntegration)
            throw new ConvexError("Owner integration not found");

          ownerIntegration = _ownerIntegration;
          ownerIntegrationMap.set(ownerIntegrationId, ownerIntegration);
        }

        let integration = integrationMap.get(ownerIntegration.integration_id);

        if (!integration) {
          const _integration = await ctx.runQuery(
            api.integrations.getIntegrationById,
            {
              id: ownerIntegration.integration_id,
            }
          );

          if (!_integration) throw new ConvexError("Integration not found");

          integration = _integration;
          integrationMap.set(ownerIntegration.integration_id, integration);
        }

        if (integration.name == "Telegram") {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await sendTelegramMessage(
            chain.chain_id,
            eventWatcher,
            event,
            Number(ownerIntegration.data.chatId),
            ownerAddressesMapped[getAddress(eventWatcher.owner)]
          );
        }
      }
    }
  },
});
