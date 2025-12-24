import { ConvexError, v } from "convex/values";
import {
  action,
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

export const getEventWatcherByIdInternal = internalQuery({
  args: { id: v.id("event_watchers") },
  handler: async (ctx, args) => ctx.db.get(args.id),
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

export const createEventWatcherAction = action({
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

    if (!args.owner_integration_ids.length)
      throw new ConvexError("args.owner_integration_ids.length !== 0");

    for (const ownerIntegrationId of args.owner_integration_ids) {
      const ownerIntegration = await ctx.runQuery(
        api.ownerIntegrations.getOwnerIntegrationById,
        {
          id: ownerIntegrationId,
        }
      );
      if (!ownerIntegration)
        throw new ConvexError("Owner integration not found");
    }

    _validateConditions(args.event_abi, args.condition);
    _validateDisplayArgs(args.event_abi, args.display);

    const currentBlock =
      await CHAIN_ID_TO_VIEM_CLIENT[chain.chain_id].getBlockNumber();

    await ctx.runMutation(internal.eventWatchers.createEventWatcherInternal, {
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

export const createEventWatcherInternal = internalMutation({
  args: {
    label: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    last_block: v.number(),
    owner: v.string(),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
  },
  handler: async (ctx, args) => ctx.db.insert("event_watchers", args),
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

export const getEventWatchersByOwnerIntegrationId = internalQuery({
  args: {
    owner: v.string(),
    owner_integration_id: v.id("owner_integrations"),
  },
  handler: async (ctx, args) => {
    const eventWatchers = await ctx.db
      .query("event_watchers")
      .withIndex("by_owner", (q) => q.eq("owner", getAddress(args.owner)))
      .collect();

    return eventWatchers.filter((eventWatcher) =>
      eventWatcher.owner_integration_ids.includes(args.owner_integration_id)
    );
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
