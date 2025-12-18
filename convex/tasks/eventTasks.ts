import { action } from "../_generated/server";
import { api } from "../_generated/api";
import { sendTelegramMessage } from "./actions/telegram";
import { ConvexError } from "convex/values";
import { mainnetViemClient } from "../viem";
import { AbiEvent, Address, parseAbiItem } from "viem";
import { convertBigIntToString } from "../helpers";

export const main = action({
  args: {},
  handler: async (ctx) => {
    const eventTasks = await ctx.runQuery(api.eventTasks.getEventTasks);

    for (const eventTask of eventTasks) {
      const taskDefinition = await ctx.runQuery(
        api.taskDefinitions.getTaskDefinitionById,
        { id: eventTask.task_definition_id }
      );
      if (!taskDefinition) throw new ConvexError("Task definition not found");

      const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
        convex_id: eventTask.chain_convex_id,
      });

      if (!chain) throw new ConvexError("Chain not found");

      if (chain.name == "Ethereum") {
        if (taskDefinition.name == "Telegram") {
          const currentBlock = await mainnetViemClient.getBlockNumber();

          const events = await mainnetViemClient.getLogs({
            address: eventTask.contract_address as Address,
            fromBlock: BigInt(eventTask.last_block + 1),
            toBlock: currentBlock,
            event: parseAbiItem(eventTask.event_abi) as AbiEvent,
          });

          for (const event of events) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await sendTelegramMessage(
              `${chain.name}\n${eventTask.contract_address}\n\n${eventTask.event_abi}\n\n${JSON.stringify(convertBigIntToString(event.args as Record<string, unknown>), null, 2)}\n\n ${event.blockNumber}-${event.blockTimestamp}\n${event.transactionHash}`,
              Number(eventTask.data.chatId)
            );
          }

          await ctx.runMutation(api.eventTasks.updateEventTaskLastBlock, {
            event_task_id: eventTask._id,
            last_block: Number(currentBlock),
          });
        }
      }
    }
  },
});
