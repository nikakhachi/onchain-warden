import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { _mustBeAuthenticated, _mustBeTeamOwner } from "./auth";
import { internal } from "./_generated/api";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { plans } from "../src/app/shared/plans";

export const getTeamById = internalQuery({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

// TODO: Revisit after subscription system is implemented
export const createTeam = mutation({
  args: {
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    throw new ConvexError(ERROR_MESSAGES.NOT_ALLOWED_FOR_FREE_TIER);

    // const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    // const teamId = await ctx.db.insert("teams", { name: args.name, is_personal: false });
    // await ctx.db.insert("team_members", { team_id: teamId, user_id: user._id, role: "owner", added_by: user._id });

    // return teamId;
  },
});

export const editTeamName = mutation({
  args: {
    id: v.id("teams"),
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    await _mustBeTeamOwner(ctx, args.id, args.accessToken);

    return await ctx.db.patch(args.id, { name: args.name });
  },
});

export const getTeamsByUserAccessToken = query({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    const members = await ctx.db
      .query("team_members")
      .withIndex("by_user_id", (q) => q.eq("user_id", user._id))
      .collect();

    const teams = (
      await Promise.all(
        members.map(async (member) => {
          const team = await ctx.db.get(member.team_id);
          return {
            ...team,
            role: member.role,
          };
        }),
      )
    ).filter((item) => item._id && item.name && item._creationTime);

    return teams;
  },
});

export const deleteTeam = mutation({
  args: {
    id: v.id("teams"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { team } = await _mustBeTeamOwner(ctx, args.id, args.accessToken);

    if (team.is_personal) throw new ConvexError(ERROR_MESSAGES.CANNOT_DELETE_PERSONAL_TEAM);

    await ctx.runMutation(internal.team.deleteTeamInternal, { team_id: args.id });
  },
});

export const deleteTeamInternal = internalMutation({
  args: {
    team_id: v.id("teams"),
  },
  handler: async (ctx, args) => {
    const teamMembers = await ctx.db
      .query("team_members")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();

    for (const member of teamMembers) {
      await ctx.db.delete(member._id);
    }

    const teamAddresses = await ctx.db
      .query("team_addresses")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();

    for (const teamAddress of teamAddresses) {
      await ctx.db.delete(teamAddress._id);
    }

    const teamIntegrations = await ctx.db
      .query("team_integrations")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();

    for (const teamIntegration of teamIntegrations) {
      const watcherIntegrations = await ctx.runQuery(
        internal.watcherIntegrations.getWatcherIntegrationsByTeamIntegrationId,
        {
          team_integration_id: teamIntegration._id,
        },
      );

      for (const watcherIntegration of watcherIntegrations) {
        await ctx.db.delete(watcherIntegration._id);
      }

      await ctx.db.delete(teamIntegration._id);
    }

    const teamEventWatchers = await ctx.db
      .query("event_watchers")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();

    for (const eventWatcher of teamEventWatchers) {
      await ctx.db.delete(eventWatcher._id);
    }

    await ctx.db.delete(args.team_id);
  },
});

export const getPersonalTeamByUserId = internalQuery({
  args: { user_id: v.id("users") },
  handler: async (ctx, args) => {
    const teamMembers = (
      await ctx.db
        .query("team_members")
        .withIndex("by_user_id", (q) => q.eq("user_id", args.user_id))
        .collect()
    ).filter((member) => member.role === "owner");

    const teams = await Promise.all(teamMembers.map(async (member) => ctx.db.get(member.team_id)));

    const personalTeam = teams.find((item) => item?.is_personal);

    if (!personalTeam) throw new ConvexError("Personal team not found");

    return personalTeam;
  },
});

export const createPremiumTeam = internalMutation({
  args: {
    user_id: v.id("users"),
  },
  handler: async (ctx, args) => {
    const alertLimit = plans.find((plan) => plan.title === "Team")?.alerts;

    if (!alertLimit) throw new ConvexError("Alert limit not found");

    const teamId = await ctx.db.insert("teams", { name: "Premium Team", is_personal: false, alert_limit: alertLimit });

    await ctx.db.insert("team_members", {
      team_id: teamId,
      user_id: args.user_id,
      role: "owner",
      added_by: args.user_id,
    });
  },
});
