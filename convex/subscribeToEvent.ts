// an action that will verify signature,  create event subscription, and create task
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../src/app/constants";
import { recoverMessageAddress } from "viem";
import { mainnetViemClient } from "./viem";

export const main = action({
  args: {
    chain_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    task_definition_id: v.id("task_definitions"),
    data: v.any(),
    signature: v.string(),
  },
  handler: async (ctx, args) => {
    const signer = await recoverMessageAddress({
      message: CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE,
      signature: args.signature as `0x${string}`,
    });

    const currentBlock = await mainnetViemClient.getBlockNumber();

    const eventSubscription = await ctx.runMutation(
      internal.eventSubscriptions.createEventSubscription,
      {
        chain_id: args.chain_id,
        contract_address: args.contract_address,
        event_abi: args.event_abi,
      }
    );

    await ctx.runMutation(internal.tasks.createTask, {
      task_definition_id: args.task_definition_id,
      event_subscription_id: eventSubscription,
      data: args.data,
      lastBlock: Number(currentBlock),
      signer,
    });
  },
});
