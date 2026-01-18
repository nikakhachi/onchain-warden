import { ConvexError, v } from "convex/values";
import { action, ActionCtx, internalMutation, internalQuery, MutationCtx, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAddress, parseAbiItem, Address } from "viem";
import { getBlockNumber, getLogs } from "./viem";
import { event_watchers_condition_column, event_watchers_display_column } from "./schema";
import { _mustBeTeamMember } from "./auth";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { validateFormula, validateConditionFormula } from "./helpers/formulaUtils";
import { Doc, Id } from "./_generated/dataModel";
import { checkAgainstConditions } from "./helpers/checkAgainstConditions";
import { handleAlertEvent } from "./helpers/handleAlertEvent";
import { CHAINS } from "./data/chains";
import { INTEGRATIONS } from "./data/integrations";

export const getActiveEventWatchers = internalQuery({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("event_watchers")
      .withIndex("by_is_active", (q) => q.eq("is_active", true))
      .collect(),
});

export const getActiveEventWatchers_1d = internalQuery({
  args: {},
  handler: async (ctx) =>
    ctx.db
      .query("event_watchers")
      .withIndex("by_is_active_and_interval", (q) => q.eq("is_active", true).eq("interval", "1d"))
      .collect(),
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
    chain_id: v.number(),
    contract_address: v.string(),
    event_abi: v.string(),
    team_integration_ids: v.array(v.id("team_integrations")),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
    accessToken: v.string(),
    severity: v.union(v.literal("info"), v.literal("low"), v.literal("medium"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const { user, team } = await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    if (team.is_personal) await _checkEventWatcherLimit(ctx, team);

    const chain = CHAINS[args.chain_id];
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
    _validateConditionFormulas(args.condition);

    const currentBlock = await getBlockNumber(args.chain_id);

    await ctx.runMutation(internal.eventWatchers.createEventWatcherInternal, {
      event_watcher: {
        label: args.label,
        chain_id: args.chain_id,
        contract_address: getAddress(args.contract_address),
        event_abi: args.event_abi,
        last_block: Number(currentBlock),
        team_id: args.team_id,
        condition: args.condition,
        display: args.display,
        added_by: user._id,
        is_active: true,
        severity: args.severity,
      },
      team_integration_ids: args.team_integration_ids,
    });
  },
});

export const createEventWatcherInternal = internalMutation({
  args: {
    event_watcher: v.object({
      label: v.string(),
      chain_id: v.number(),
      contract_address: v.string(),
      event_abi: v.string(),
      last_block: v.number(),
      team_id: v.id("teams"),
      condition: event_watchers_condition_column,
      display: event_watchers_display_column,
      added_by: v.id("users"),
      is_active: v.boolean(),
      severity: v.optional(v.union(v.literal("info"), v.literal("low"), v.literal("medium"), v.literal("critical"))),
    }),
    team_integration_ids: v.array(v.id("team_integrations")),
  },
  handler: async (ctx, args) => {
    const eventWatcherId = await ctx.db.insert("event_watchers", args.event_watcher);

    for (const teamIntegrationId of args.team_integration_ids) {
      await ctx.runMutation(internal.watcherIntegrations.createWatcherIntegrationInternal, {
        event_watcher_id: eventWatcherId,
        team_integration_id: teamIntegrationId,
      });
    }
  },
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
    severity: v.optional(v.union(v.literal("info"), v.literal("low"), v.literal("medium"), v.literal("critical"))),
  },
  handler: async (ctx, args) => {
    const { eventWatcher } = await _mustBeTeamMemberOfTheEventWatcher(ctx, args.id, args.accessToken);

    if (!args.team_integration_ids.length) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_IDS_EMPTY);

    for (const teamIntegrationId of args.team_integration_ids) {
      const teamIntegration = await ctx.runQuery(internal.teamIntegrations.getTeamIntegrationById, {
        id: teamIntegrationId,
      });
      if (!teamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);
      if (teamIntegration.team_id !== eventWatcher.team_id)
        throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_BELONGS_TO_TEAM);
    }

    _validateConditions(eventWatcher.event_abi, args.condition);
    _validateDisplayArgs(eventWatcher.event_abi, args.display);
    _validateConditionFormulas(args.condition);

    await ctx.db.patch(args.id, {
      label: args.label,
      condition: args.condition,
      display: args.display,
      severity: args.severity,
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
    await _mustBeTeamMemberOfTheEventWatcher(ctx, args.id, args.accessToken);

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

export const deactivateEventWatcher = mutation({
  args: {
    id: v.id("event_watchers"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { eventWatcher } = await _mustBeTeamMemberOfTheEventWatcher(ctx, args.id, args.accessToken);

    if (!eventWatcher.is_active) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_ALREADY_INACTIVE);

    await ctx.db.patch(args.id, { is_active: false });
  },
});

export const activateEventWatcher = action({
  args: {
    id: v.id("event_watchers"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { eventWatcher } = await _mustBeTeamMemberOfTheEventWatcher(ctx, args.id, args.accessToken);

    if (eventWatcher.is_active) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_ALREADY_ACTIVE);

    const chainId = eventWatcher.chain_id!;

    const chain = CHAINS[chainId];
    if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);

    const blockNumber = await getBlockNumber(chainId);

    await ctx.runMutation(internal.eventWatchers.activateEventWatcherInternal, {
      id: args.id,
      last_block: Number(blockNumber),
    });
  },
});

export const activateEventWatcherInternal = internalMutation({
  args: {
    id: v.id("event_watchers"),
    last_block: v.number(),
  },
  handler: async (ctx, args) => ctx.db.patch(args.id, { is_active: true, last_block: args.last_block }),
});

export const duplicateEventWatcher = action({
  args: {
    id: v.id("event_watchers"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { eventWatcher, team } = await _mustBeTeamMemberOfTheEventWatcher(ctx, args.id, args.accessToken);

    if (team.is_personal) await _checkEventWatcherLimit(ctx, team);

    const chainId = eventWatcher.chain_id!;

    const chain = CHAINS[chainId];
    if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);

    const currentBlock = await getBlockNumber(chainId);

    const watcherIntegrations = await ctx.runQuery(
      internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId,
      { event_watcher_id: eventWatcher._id },
    );

    await ctx.runMutation(internal.eventWatchers.createEventWatcherInternal, {
      event_watcher: {
        label: eventWatcher.label + " (Duplicate)",
        chain_id: chainId,
        contract_address: eventWatcher.contract_address,
        event_abi: eventWatcher.event_abi,
        team_id: eventWatcher.team_id,
        condition: eventWatcher.condition,
        display: eventWatcher.display,
        added_by: eventWatcher.added_by,
        is_active: false,
        last_block: Number(currentBlock),
      },
      team_integration_ids: watcherIntegrations.map((item) => item.team_integration_id),
    });
  },
});

const _checkEventWatcherLimit = async (ctx: ActionCtx | MutationCtx, team: Doc<"teams">) => {
  const eventWatcherCount = await ctx.runQuery(api.eventWatchers.getEventWatchersByTeamId, {
    team_id: team._id,
  });
  if (eventWatcherCount.length >= team.alert_limit) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_LIMIT_REACHED);
};

const _mustBeTeamMemberOfTheEventWatcher = async (
  ctx: ActionCtx | MutationCtx,
  event_watcher_id: Id<"event_watchers">,
  access_token: string,
) => {
  const eventWatcher = await ctx.runQuery(internal.eventWatchers.getEventWatcherById, {
    id: event_watcher_id,
  });
  if (!eventWatcher) throw new ConvexError(ERROR_MESSAGES.EVENT_WATCHER_NOT_FOUND);

  const { team } = await _mustBeTeamMember(ctx, eventWatcher.team_id, access_token);

  return { eventWatcher, team };
};

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

    // Validate formula if present
    if (displayItem.formula && displayItem.formula.trim() !== "") {
      const validation = validateFormula(displayItem.formula);
      if (!validation.isValid) {
        throw new ConvexError(
          `Invalid formula for argument ${displayItem.key}: ${validation.error || "Invalid formula syntax"}`,
        );
      }
    }
  }
};

const _validateConditionFormulas = (conditions: (typeof event_watchers_condition_column.type)[number][]) => {
  for (const condition of conditions) {
    // Validate custom formula conditions
    if (condition.operator === "custom_formula") {
      const validation = validateConditionFormula(condition.value, condition.field);
      if (!validation.isValid) {
        throw new ConvexError(validation.error || "Invalid formula condition");
      }
    }
  }
};

export const simulateAlert = action({
  args: {
    teamIntegrationIds: v.array(v.id("team_integrations")),
    blockNumber: v.number(),
    contractAddress: v.string(),
    chainId: v.number(),
    eventAbi: v.string(),
    conditions: event_watchers_condition_column,
    display: event_watchers_display_column,
    label: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.teamIntegrationIds.length) throw new ConvexError("At least one integration must be selected");

    // Verify user has access to all team integrations and get them
    const teamIntegrations = await Promise.all(
      args.teamIntegrationIds.map(async (id) => {
        const teamIntegration = await ctx.runQuery(internal.teamIntegrations.getTeamIntegrationById, {
          id,
        });
        if (!teamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);
        await _mustBeTeamMember(ctx, teamIntegration.team_id, args.accessToken);
        return teamIntegration;
      }),
    );

    // Get integration details for all team integrations
    const integrationsData = await Promise.all(
      teamIntegrations.map(async (teamIntegration) => {
        const integration = INTEGRATIONS[teamIntegration.integration_id];
        if (!integration) throw new ConvexError(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);
        return { teamIntegration, integration };
      }),
    );

    // Get chain details
    const chain = CHAINS[args.chainId];
    if (!chain) throw new ConvexError(ERROR_MESSAGES.CHAIN_NOT_FOUND);

    const blockBigInt = BigInt(args.blockNumber);

    // Get logs for the single block
    const events = await getLogs(
      args.chainId,
      getAddress(args.contractAddress) as Address,
      blockBigInt,
      blockBigInt,
      [args.eventAbi],
      {},
      true,
    );

    const teamId = teamIntegrations[0].team_id;

    // Create a temporary event watcher object for buildText
    const tempEventWatcher = {
      _id: "" as Id<"event_watchers">,
      _creationTime: Date.now(),
      label: args.label,
      chain_id: args.chainId,
      contract_address: args.contractAddress,
      event_abi: args.eventAbi,
      last_block: args.blockNumber,
      team_id: teamId,
      condition: args.conditions,
      display: args.display,
      added_by: "" as Id<"users">,
      is_active: true,
    };

    // Filter events by conditions
    const filteredEvents = events.filter((event) => checkAgainstConditions(event, tempEventWatcher));

    if (!filteredEvents.length) {
      throw new ConvexError(
        `No events found in block ${args.blockNumber} matching the provided conditions. Please verify the block number and conditions.`,
      );
    }

    // Get team addresses for labels (use the first team's addresses, all integrations should be from the same team)
    const allTeamAddresses = await ctx.runQuery(internal.teamAddresses.getAllTeamAddressesMapped);
    const teamAddressesMapped = allTeamAddresses[teamId] || {};
    const addressesMapped: Record<string, string> = {};
    Object.entries(teamAddressesMapped).forEach(([address, label]) => {
      addressesMapped[address.toLowerCase()] = label;
    });

    // Send notification to all selected integrations
    await Promise.all(
      integrationsData.map(({ teamIntegration, integration }) =>
        handleAlertEvent(
          tempEventWatcher,
          integration.name as "Telegram" | "Discord" | "Slack",
          teamIntegration.data,
          args.chainId,
          filteredEvents[0],
          addressesMapped,
        ),
      ),
    );
  },
});

export const writeLastEmit = internalMutation({
  args: {
    watcher_id: v.id("event_watchers"),
    last_emit: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.watcher_id, { last_emit: args.last_emit });
  },
});
