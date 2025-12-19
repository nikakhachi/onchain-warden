import { ConvexError, v } from "convex/values";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAddress, parseAbiItem, recoverMessageAddress } from "viem";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../src/app/constants";
import { CHAIN_ID_TO_VIEM_CLIENT } from "./viem";

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
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    owner: v.string(),
    signature: v.string(),
    condition: v.array(
      v.object({
        field: v.string(),
        operator: v.string(),
        value: v.string(),
      })
    ),
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

    if (args.condition) {
      for (const condition of args.condition) {
        const correspondingEventArgument = parseAbiItem(
          args.event_abi
          // @ts-ignore
        ).inputs.find((item) => item.name === condition.field);

        if (!correspondingEventArgument)
          throw new ConvexError("Invalid correspondingEventArgument");
      }
    }

    await ctx.runMutation(internal.eventWatchers.createEventWatcherInternal, {
      owner_integration_ids: args.owner_integration_ids,
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      last_block: Number(currentBlock),
      owner: getAddress(signer),
      condition: args.condition,
    });
  },
});

export const createEventWatcherInternal = internalMutation({
  args: {
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    last_block: v.number(),
    owner: v.string(),
    condition: v.array(
      v.object({
        field: v.string(),
        operator: v.string(),
        value: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("event_watchers", {
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      owner_integration_ids: args.owner_integration_ids,
      last_block: args.last_block,
      owner: args.owner,
      condition: args.condition,
    });
  },
});
