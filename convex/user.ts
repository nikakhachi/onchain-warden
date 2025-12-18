import { ConvexError, v } from "convex/values";
import { action, query } from "./_generated/server";
import { getAddress, recoverMessageAddress } from "viem";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../src/app/constants";
import { mainnetViemClient } from "./viem";
import { internal } from "./_generated/api";

export const getUsersTasks = query({
  args: {
    wallet_address: v.string(),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("signer"), getAddress(args.wallet_address)))
      .collect();

    const userTasks: any[] = [];

    for (const task of tasks) {
      const eventSubscription = await ctx.db
        .query("event_subscriptions")
        .filter((q) => q.eq(q.field("_id"), task.event_subscription_id))
        .first();

      if (!eventSubscription)
        throw new ConvexError("Event subscription not found");

      const taskDefinition = await ctx.db
        .query("task_definitions")
        .filter((q) => q.eq(q.field("_id"), task.task_definition_id))
        .first();

      if (!taskDefinition) throw new ConvexError("Task definition not found");

      const chain = await ctx.db.get(eventSubscription.chain);

      userTasks.push({
        task,
        eventSubscription,
        taskDefinition,
        chain,
      });
    }

    return userTasks;
  },
});

export const subscribeToEvent = action({
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
