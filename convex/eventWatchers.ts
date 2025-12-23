import { ConvexError, v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAddress, parseAbiItem } from "viem";
import { CHAIN_ID_TO_VIEM_CLIENT } from "./viem";
import {
  event_watchers_condition_column,
  event_watchers_display_column,
} from "./schema";

export const getEventWatchers = internalQuery({
  args: {},
  handler: async (ctx) => ctx.db.query("event_watchers").collect(),
});

export const updateEventWatcherLastBlock = internalMutation({
  args: {
    event_watcher_id: v.id("event_watchers"),
    last_block: v.number(),
  },
  handler: async (ctx, args) =>
    ctx.db.patch(args.event_watcher_id, {
      last_block: args.last_block,
    }),
});

export const createEventWatcher = mutation({
  args: {
    label: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { owner } = await ctx.runQuery(internal.auth.validateToken, {
      token: args.accessToken,
    });

    const chain = await ctx.runQuery(api.chains.getChainByConvexId, {
      convex_id: args.chain_convex_id,
    });

    if (!chain) throw new ConvexError("Chain not found");

    _validateConditions(args.event_abi, args.condition);
    _validateDisplayArgs(args.event_abi, args.display);

    const currentBlock =
      await CHAIN_ID_TO_VIEM_CLIENT[chain.chain_id].getBlockNumber();

    await ctx.db.insert("event_watchers", {
      label: args.label,
      owner_integration_ids: args.owner_integration_ids,
      chain_convex_id: args.chain_convex_id,
      contract_address: args.contract_address,
      event_abi: args.event_abi,
      last_block: Number(currentBlock),
      owner: getAddress(owner),
      condition: args.condition,
      display: args.display,
    });
  },
});

export const getEventWatcherById = query({
  args: {
    id: v.id("event_watchers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateEventWatcher = mutation({
  args: {
    id: v.id("event_watchers"),
    label: v.string(),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
    owner_integration_ids: v.array(v.id("owner_integrations")),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { owner } = await ctx.runQuery(internal.auth.validateToken, {
      token: args.accessToken,
    });

    const existing = await ctx.runQuery(api.eventWatchers.getEventWatcherById, {
      id: args.id,
    });

    if (!existing) throw new ConvexError("Watcher not found");
    if (getAddress(existing.owner) !== getAddress(owner))
      throw new ConvexError("Unauthorized");

    _validateConditions(existing.event_abi, args.condition);
    _validateDisplayArgs(existing.event_abi, args.display);

    return await ctx.db.patch(args.id, {
      label: args.label,
      condition: args.condition,
      display: args.display,
      owner_integration_ids: args.owner_integration_ids,
    });
  },
});

export const deleteEventWatcher = mutation({
  args: {
    id: v.id("event_watchers"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { owner } = await ctx.runQuery(internal.auth.validateToken, {
      token: args.accessToken,
    });

    const existing = await ctx.runQuery(api.eventWatchers.getEventWatcherById, {
      id: args.id,
    });

    if (!existing) throw new ConvexError("Watcher not found");
    if (getAddress(existing.owner) !== getAddress(owner))
      throw new ConvexError("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

const _validateConditions = (
  event_abi: string,
  conditions: (typeof event_watchers_condition_column.type)[number][]
) => {
  for (const condition of conditions) {
    // @ts-ignore
    const eArg = parseAbiItem(event_abi).inputs.find(
      // @ts-ignore
      (item) => item.name === condition.field
    );
    if (!eArg) throw new ConvexError("Invalid eArg (args.condition)");
  }
};

const _validateDisplayArgs = (
  event_abi: string,
  display: typeof event_watchers_display_column.type
) => {
  for (const displayItem of display.args) {
    // @ts-ignore
    const eArg = parseAbiItem(event_abi).inputs.find(
      // @ts-ignore
      (item) => item.name === displayItem.key
    );
    if (!eArg) throw new ConvexError("Invalid eArg (args.display.args)");
  }
};
