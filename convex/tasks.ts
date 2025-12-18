// getter and adder for actions
import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { getAddress } from "viem";

export const getTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const updateTaskLastBlock = mutation({
  args: {
    taskId: v.id("tasks"),
    lastBlock: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.taskId, { last_block: args.lastBlock });
  },
});

export const createTask = internalMutation({
  args: {
    task_definition_id: v.id("task_definitions"),
    event_subscription_id: v.id("event_subscriptions"),
    data: v.any(),
    lastBlock: v.number(),
    signer: v.string(),
  },
  handler: async (ctx, args) => {
    const taskDefinition = await ctx.runQuery(
      api.taskDefinitions.getTaskDefinitionById,
      {
        id: args.task_definition_id,
      }
    );
    if (!taskDefinition) throw new ConvexError("Task definition not found");

    const eventSubscription = await ctx.runQuery(
      api.eventSubscriptions.getEventSubscriptionById,
      {
        id: args.event_subscription_id,
      }
    );
    if (!eventSubscription)
      throw new ConvexError("Event subscription not found");

    if (taskDefinition.name == "Telegram" && !args.data.chatId) {
      throw new ConvexError("Chat ID is required for Telegram task");
    }

    return await ctx.db.insert("tasks", {
      task_definition_id: args.task_definition_id as any,
      event_subscription_id: args.event_subscription_id as any,
      data: args.data,
      last_block: args.lastBlock,
      signer: getAddress(args.signer),
    });
  },
});
