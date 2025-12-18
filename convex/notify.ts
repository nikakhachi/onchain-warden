import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { sendTelegramMessage } from "./actionss/telegram";
import { ConvexError } from "convex/values";
import { mainnetViemClient } from "./viem";
import { AbiEvent, Address, parseAbiItem } from "viem";
import { convertBigIntToString } from "./helpers/helpers";

export const notify = action({
  args: {},
  handler: async (ctx) => {
    const tasks = await ctx.runQuery(api.tasks.getTasks);

    for (const task of tasks) {
      const taskDefinition = await ctx.runQuery(
        api.taskDefinitions.getTaskDefinitionById,
        { id: task.task_definition_id }
      );
      if (!taskDefinition) throw new ConvexError("Task definition not found");

      const eventSubscription = await ctx.runQuery(
        api.eventSubscriptions.getEventSubscriptionById,
        { id: task.event_subscription_id }
      );
      if (!eventSubscription)
        throw new ConvexError("Event subscription not found");

      const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
        convexId: eventSubscription?.chain,
      });

      if (!chain) throw new ConvexError("Chain not found");

      if (chain.name == "Ethereum") {
        if (taskDefinition.name == "Telegram") {
          const currentBlock = await mainnetViemClient.getBlockNumber();

          const events = await mainnetViemClient.getLogs({
            address: eventSubscription.contract_address as Address,
            fromBlock: BigInt(task.last_block + 1),
            toBlock: currentBlock,
            event: parseAbiItem(eventSubscription.event_abi) as AbiEvent,
          });

          for (const event of events) {
            await sendTelegramMessage(
              `${chain.name}\n${eventSubscription.contract_address}\n\n${eventSubscription.event_abi}\n\n${JSON.stringify(convertBigIntToString(event.args as Record<string, unknown>), null, 2)}\n\n ${event.blockNumber}-${event.blockTimestamp}\n${event.transactionHash}`,
              Number(task.data.chatId)
            );
          }

          await ctx.runMutation(api.tasks.updateTaskLastBlock, {
            taskId: task._id,
            lastBlock: Number(currentBlock),
          });
        }
      }
    }
  },
});
