import { ConvexError, v } from "convex/values";
import { action, internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAddress, parseAbiItem } from "viem";
import { getBlockNumber } from "./viem";
import { event_watchers_condition_column, event_watchers_display_column } from "./schema";
import { _mustBeTeamMember } from "./auth";
import { ERROR_MESSAGES } from "./errors/errorMessages";

export const getEventWatchers = internalQuery({
  args: {},
  handler: async (ctx) => ctx.db.query("event_watchers").collect(),
});

export const getEventWatcherById = internalQuery({
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
    team_id: v.id("teams"),
    label: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    team_integration_ids: v.array(v.id("team_integrations")),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    const chain = await ctx.runQuery(internal.chains.getChainByConvexId, { convex_id: args.chain_convex_id });

    if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);

    if (!args.team_integration_ids.length) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_IDS_EMPTY);

    for (const teamIntegrationId of args.team_integration_ids) {
      const teamIntegration = await ctx.runQuery(internal.teamIntegrations.getTeamIntegrationById, {
        id: teamIntegrationId,
      });
      if (!teamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);
      if (teamIntegration.team_id !== args.team_id)
        throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_BELONGS_TO_TEAM);
    }

    _validateConditions(args.event_abi, args.condition);
    _validateDisplayArgs(args.event_abi, args.display);

    const currentBlock = await getBlockNumber(chain.chain_id);

    const eventWatcherId = await ctx.runMutation(internal.eventWatchers.createEventWatcherInternal, {
      label: args.label,
      chain_convex_id: args.chain_convex_id,
      contract_address: getAddress(args.contract_address),
      event_abi: args.event_abi,
      last_block: Number(currentBlock),
      team_id: args.team_id,
      condition: args.condition,
      display: args.display,
      added_by: user._id,
    });

    for (const teamIntegrationId of args.team_integration_ids) {
      await ctx.runMutation(internal.watcherIntegrations.createWatcherIntegrationInternal, {
        event_watcher_id: eventWatcherId,
        team_integration_id: teamIntegrationId,
      });
    }
  },
});

export const createEventWatcherInternal = internalMutation({
  args: {
    label: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    last_block: v.number(),
    team_id: v.id("teams"),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
    added_by: v.id("users"),
  },
  handler: async (ctx, args) => ctx.db.insert("event_watchers", args),
});

export const getEventWatchersByTeamId = query({
  args: {
    team_id: v.id("teams"),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("event_watchers")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();
  },
});

export const updateEventWatcher = mutation({
  args: {
    id: v.id("event_watchers"),
    label: v.string(),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
    team_integration_ids: v.array(v.id("team_integrations")),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const existingEventWatcher = await ctx.runQuery(internal.eventWatchers.getEventWatcherById, {
      id: args.id,
    });
    if (!existingEventWatcher) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_NOT_FOUND);

    await _mustBeTeamMember(ctx, existingEventWatcher.team_id, args.accessToken);

    _validateConditions(existingEventWatcher.event_abi, args.condition);
    _validateDisplayArgs(existingEventWatcher.event_abi, args.display);

    await ctx.db.patch(args.id, {
      label: args.label,
      condition: args.condition,
      display: args.display,
    });

    await ctx.runMutation(internal.watcherIntegrations.updateWatcherIntegrations, {
      event_watcher_id: args.id,
      team_integration_ids: args.team_integration_ids,
    });
  },
});

export const deleteEventWatcher = mutation({
  args: {
    id: v.id("event_watchers"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const existingEventWatcher = await ctx.runQuery(internal.eventWatchers.getEventWatcherById, {
      id: args.id,
    });
    if (!existingEventWatcher) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_NOT_FOUND);

    await _mustBeTeamMember(ctx, existingEventWatcher.team_id, args.accessToken);

    const watcherIntegrations = await ctx.runQuery(
      internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId,
      { event_watcher_id: args.id },
    );

    await Promise.all(
      watcherIntegrations.map((watcherIntegration) =>
        ctx.runMutation(internal.watcherIntegrations.deleteWatcherIntegrationInternal, {
          id: watcherIntegration._id,
        }),
      ),
    );

    await ctx.db.delete(args.id);
  },
});

const _findFieldInInputs = (fieldPath: string, inputs: any[]): any | null => {
  if (!fieldPath.includes(".")) {
    return inputs.find((item: any) => item.name === fieldPath) || null;
  }

  const parts = fieldPath.split(".");
  const [parentField, ...nestedPath] = parts;

  const parentInput = inputs.find((item: any) => item.name === parentField);
  if (!parentInput) return null;

  // If parent is a tuple with components, recursively search in components
  if (parentInput.type === "tuple" && parentInput.components) {
    const nestedField = nestedPath.join(".");
    return _findFieldInInputs(nestedField, parentInput.components);
  }

  return null;
};

const _validateConditions = (
  event_abi: string,
  conditions: (typeof event_watchers_condition_column.type)[number][],
) => {
  const parsed = parseAbiItem(event_abi);
  // @ts-ignore
  const inputs = parsed.inputs.map((item: any, idx: number) => ({
    ...item,
    name: item.name || `argument${idx}`,
  }));

  for (const condition of conditions) {
    const eArg = _findFieldInInputs(condition.field, inputs);
    if (!eArg) throw new ConvexError(ERROR_MESSAGES.INVALID_EARG_CONDITION);
  }
};

const _validateDisplayArgs = (event_abi: string, display: typeof event_watchers_display_column.type) => {
  const parsed = parseAbiItem(event_abi);
  // @ts-ignore
  const inputs = parsed.inputs.map((item: any, idx: number) => ({
    ...item,
    name: item.name || `argument${idx}`,
  }));

  for (const displayItem of display.args) {
    const eArg = _findFieldInInputs(displayItem.key, inputs);
    if (!eArg) throw new ConvexError(ERROR_MESSAGES.INVALID_EARG_DISPLAY_ARGS);
  }
};
