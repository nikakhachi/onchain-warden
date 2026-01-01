import { v } from "convex/values";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

export const createWatcherIntegrationInternal = internalMutation({
  args: {
    event_watcher_id: v.id("event_watchers"),
    team_integration_id: v.id("team_integrations"),
  },
  handler: async (ctx, args) => ctx.db.insert("watcher_integrations", args),
});

export const getWatcherIntegrationsByEventWatcherId = internalQuery({
  args: { event_watcher_id: v.id("event_watchers") },
  handler: async (ctx, args) =>
    ctx.db
      .query("watcher_integrations")
      .withIndex("by_event_watcher_id", (q) => q.eq("event_watcher_id", args.event_watcher_id))
      .collect(),
});

export const getWatcherIntegrationsByTeamIntegrationId = internalQuery({
  args: { team_integration_id: v.id("team_integrations") },
  handler: async (ctx, args) =>
    ctx.db
      .query("watcher_integrations")
      .withIndex("by_team_integration_id", (q) => q.eq("team_integration_id", args.team_integration_id))
      .collect(),
});

export const deleteWatcherIntegrationInternal = internalMutation({
  args: { id: v.id("watcher_integrations") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

export const updateWatcherIntegrations = internalMutation({
  args: {
    event_watcher_id: v.id("event_watchers"),
    team_integration_ids: v.array(v.id("team_integrations")),
  },
  handler: async (ctx, args) => {
    const existingWatcherIntegrations = await ctx.runQuery(
      internal.watcherIntegrations.getWatcherIntegrationsByEventWatcherId,
      {
        event_watcher_id: args.event_watcher_id,
      },
    );

    const toDelete = existingWatcherIntegrations.filter(
      (item) => !args.team_integration_ids.includes(item.team_integration_id),
    );

    const toCreate = args.team_integration_ids.filter(
      (teamIntegrationId) =>
        !existingWatcherIntegrations.some(
          (watcherIntegration) => watcherIntegration.team_integration_id === teamIntegrationId,
        ),
    );

    await Promise.all(
      toDelete.map((item) =>
        ctx.runMutation(internal.watcherIntegrations.deleteWatcherIntegrationInternal, { id: item._id }),
      ),
    );
    await Promise.all(
      toCreate.map((teamIntegrationId) =>
        ctx.runMutation(internal.watcherIntegrations.createWatcherIntegrationInternal, {
          event_watcher_id: args.event_watcher_id,
          team_integration_id: teamIntegrationId,
        }),
      ),
    );
  },
});

export const getWatcherIntegrationsByTeamIntegrationIds = query({
  args: { team_integration_ids: v.array(v.id("team_integrations")) },
  handler: async (ctx, args) => {
    const watcherIntegrations: Doc<"watcher_integrations">[] = [];

    for (const teamIntegrationId of args.team_integration_ids) {
      const watcherIntegrations = await ctx.runQuery(
        internal.watcherIntegrations.getWatcherIntegrationsByTeamIntegrationId,
        {
          team_integration_id: teamIntegrationId,
        },
      );
      watcherIntegrations.push(...watcherIntegrations);
    }
    return watcherIntegrations;
  },
});
