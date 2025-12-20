import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAddress, parseAbiItem, recoverMessageAddress } from "viem";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../src/app/constants";
import { CHAIN_ID_TO_VIEM_CLIENT } from "./viem";
import {
  event_watchers_condition_column,
  event_watchers_display_column,
} from "./schema";

export const getEventWatchers = query({
  args: {},
  handler: async (ctx) => ctx.db.query("event_watchers").collect(),
});

export const updateEventWatcherLastBlock = mutation({
  args: {
    event_watcher_id: v.id("event_watchers"),
    last_block: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.event_watcher_id, {
      last_block: args.last_block,
    });
  },
});

export const createEventWatcherAction = action({
  args: {
    label: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    owner: v.string(),
    signature: v.string(),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
  },
  handler: async (ctx, args) => {
    const signer = await recoverMessageAddress({
      message: CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE,
      signature: args.signature as `0x${string}`,
    });

    if (getAddress(signer) !== getAddress(args.owner))
      throw new ConvexError("Invalid signature");

    const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
      convex_id: args.chain_convex_id,
    });

    if (!chain) throw new ConvexError("Chain not found");

    const currentBlock =
      await CHAIN_ID_TO_VIEM_CLIENT[chain.chain_id].getBlockNumber();

    for (const condition of args.condition) {
      const eArg = parseAbiItem(
        args.event_abi
        // @ts-ignore
      ).inputs.find((item) => item.name === condition.field);

      if (!eArg) throw new ConvexError("Invalid eArg (args.condition)");
    }

    for (const displayItem of args.display.args) {
      const eArg = parseAbiItem(
        args.event_abi
        // @ts-ignore
      ).inputs.find((item) => item.name === displayItem.key);

      if (!eArg) throw new ConvexError("Invalid eArg (args.display.args)");
    }

    await ctx.runMutation(internal.eventWatchers.createEventWatcherInternal, {
      label: args.label,
      owner_integration_ids: args.owner_integration_ids,
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      last_block: Number(currentBlock),
      owner: getAddress(signer),
      condition: args.condition,
      display: args.display,
    });
  },
});

export const createEventWatcherInternal = internalMutation({
  args: {
    label: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    last_block: v.number(),
    owner: v.string(),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("event_watchers", {
      label: args.label,
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      owner_integration_ids: args.owner_integration_ids,
      last_block: args.last_block,
      owner: args.owner,
      condition: args.condition,
      display: args.display,
    });
  },
});
