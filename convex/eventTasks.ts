// getter and adder for actions
import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAddress, recoverMessageAddress } from "viem";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../src/app/constants";
import { CHAIN_ID_TO_VIEM_CLIENT, mainnetViemClient } from "./viem";

export const getEventTasks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("event_tasks").collect();
  },
});

export const updateEventTaskLastBlock = mutation({
  args: {
    event_task_id: v.id("event_tasks"),
    last_block: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.event_task_id, {
      last_block: args.last_block,
    });
  },
});

export const createEventTaskAction = action({
  args: {
    chain_convex_id: v.id("chains"),
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

    const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
      convex_id: args.chain_convex_id,
    });

    if (!chain) throw new ConvexError("Chain not found");

    const currentBlock =
      await CHAIN_ID_TO_VIEM_CLIENT[chain.chain_id].getBlockNumber();

    await ctx.runMutation(internal.eventTasks.createEventTaskInternal, {
      task_definition_id: args.task_definition_id,
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      data: args.data,
      last_block: Number(currentBlock),
      owner: getAddress(signer),
    });
  },
});

export const createEventTaskInternal = internalMutation({
  args: {
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    task_definition_id: v.id("task_definitions"),
    data: v.any(),
    last_block: v.number(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    const taskDefinition = await ctx.runQuery(
      api.taskDefinitions.getTaskDefinitionById,
      {
        id: args.task_definition_id,
      }
    );
    if (!taskDefinition) throw new ConvexError("Task definition not found");

    for (const requiredField of taskDefinition.required_data) {
      if (!args.data[requiredField]) {
        throw new ConvexError(
          `${requiredField} is required for ${taskDefinition.name} task`
        );
      }
    }

    return await ctx.db.insert("event_tasks", {
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      task_definition_id: args.task_definition_id as any,
      data: args.data,
      last_block: args.last_block,
      owner: args.owner,
    });
  },
});
