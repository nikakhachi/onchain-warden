import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { getAddress } from "viem";
import { _mustBeAuthenticated, _mustBeTeamOwner } from "./auth";
import { internal } from "./_generated/api";
import { ERROR_MESSAGES } from "./errors/errorMessages";

export const getTeamById = internalQuery({
  args: { id: v.id("teams") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const createTeam = mutation({
  args: {
    name: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    const teamId = await ctx.db.insert("teams", { name: args.name, owner_user_id: user._id });
    return teamId;
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

export const changeTeamOwner = mutation({
  args: {
    id: v.id("teams"),
    new_owner_wallet_address: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    await _mustBeTeamOwner(ctx, args.id, args.accessToken);

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_wallet_address", (q) => q.eq("wallet_address", getAddress(args.new_owner_wallet_address)))
      .unique();

    if (!existingUser) throw new ConvexError(ERROR_MESSAGES.NEW_OWNER_NOT_FOUND);

    return await ctx.db.patch(args.id, { owner_user_id: existingUser._id });
  },
});

export const getTeamsByUserAccessToken = query({
  args: { accessToken: v.string() },
  handler: async (ctx, args) => {
    const { user } = await _mustBeAuthenticated(ctx, args.accessToken);

    const teams_owner = await ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("owner_user_id", user._id))
      .collect();

    const members = await ctx.db
      .query("team_members")
      .withIndex("by_user", (q) => q.eq("user_id", user._id))
      .collect();

    const teams_member = (await Promise.all(members.map(async (member) => ctx.db.get(member.team_id)))).filter(
      (item) => item !== null,
    );

    return [...teams_owner, ...teams_member];
  },
});

export const deleteTeam = mutation({
  args: {
    id: v.id("teams"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await _mustBeTeamOwner(ctx, args.id, args.accessToken);

    const userTeams = await ctx.db
      .query("teams")
      .withIndex("by_owner", (q) => q.eq("owner_user_id", user._id))
      .collect();

    if (userTeams.length === 1) throw new ConvexError(ERROR_MESSAGES.CANNOT_DELETE_LAST_TEAM);

    const teamMembers = await ctx.db
      .query("team_members")
      .withIndex("by_team", (q) => q.eq("team_id", args.id))
      .collect();

    for (const member of teamMembers) {
      await ctx.db.delete(member._id);
    }

    const teamAddresses = await ctx.db
      .query("team_addresses")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.id))
      .collect();

    for (const teamAddress of teamAddresses) {
      await ctx.db.delete(teamAddress._id);
    }

    const teamIntegrations = await ctx.db
      .query("team_integrations")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.id))
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
      .withIndex("by_team_id", (q) => q.eq("team_id", args.id))
      .collect();

    for (const eventWatcher of teamEventWatchers) {
      await ctx.db.delete(eventWatcher._id);
    }

    await ctx.db.delete(args.id);
  },
});
