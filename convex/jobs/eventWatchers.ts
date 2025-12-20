import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { sendTelegramMessage } from "../integrations/telegram";
import { ConvexError } from "convex/values";
import { CHAIN_ID_TO_VIEM_CLIENT } from "../viem";
import { AbiEvent, Address, parseAbiItem } from "viem";
import { checkAgainstConditions } from "../helpers/checkAgainstConditions";

export const main = action({
  args: {},
  handler: async (ctx) => {
    const eventWatchers = await ctx.runQuery(
      api.eventWatchers.getEventWatchers
    );

    await Promise.all(
      eventWatchers.map(async (eventWatcher) => {
        const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
          convex_id: eventWatcher.chain_convex_id,
        });

        if (!chain) throw new ConvexError("Chain not found");

        const viemClient = CHAIN_ID_TO_VIEM_CLIENT[chain.chain_id];

        const currentBlock = await viemClient.getBlockNumber();

        const events = await viemClient.getLogs({
          address: eventWatcher.contract_address as Address,
          fromBlock: BigInt(eventWatcher.last_block + 1),
          toBlock: currentBlock,
          event: parseAbiItem(eventWatcher.event_abi) as AbiEvent,
        });

        for (const event of events) {
          if (!checkAgainstConditions(event, eventWatcher.condition)) continue;
          for (const ownerIntegrationId of eventWatcher.owner_integration_ids) {
            const ownerIntegration = await ctx.runQuery(
              api.ownerIntegrations.getOwnerIntegrationById,
              {
                id: ownerIntegrationId,
              }
            );

            if (!ownerIntegration)
              throw new ConvexError("Owner integration not found");

            const integration = await ctx.runQuery(
              api.integrations.getIntegrationById,
              {
                id: ownerIntegration.integration_id,
              }
            );

            if (!integration) throw new ConvexError("Integration not found");

            if (integration.name == "Telegram") {
              // in a group bot has limit of 20 message per 1 minute
              await new Promise((resolve) => setTimeout(resolve, 3000));
              await sendTelegramMessage(
                chain.chain_id,
                eventWatcher,
                event,
                Number(ownerIntegration.data.chatId)
              );
            }
          }
        }

        await ctx.runMutation(api.eventWatchers.updateEventWatcherLastBlock, {
          event_watcher_id: eventWatcher._id,
          last_block: Number(currentBlock),
        });
      })
    );
  },
});
