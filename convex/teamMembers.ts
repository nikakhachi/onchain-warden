import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { getAddress } from "viem";
import { Doc } from "./_generated/dataModel";

export const getTeamMembersByTeamId = query({
  args: { team_id: v.id("teams") },
  handler: async (ctx, args) => {
    const teamMembers = await ctx.db
      .query("team_members")
      .withIndex("by_team", (q) => q.eq("team_id", args.team_id))
      .collect();

    const membersWithUsers = await Promise.all(
      teamMembers.map(async (member) => {
        const user = await ctx.db.get(member.user_id);
        return {
          ...member,
          user,
        };
      }),
    );

    return membersWithUsers;
  },
});

export const addTeamMember = mutation({
  args: {
    team_id: v.id("teams"),
    wallet_address: v.string(),
    role: v.union(v.literal("member"), v.literal("admin")),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: args.accessToken })) as Doc<"users">;

    const team = await ctx.db.get(args.team_id);
    if (!team) throw new ConvexError("Team not found");

    const isTeamOwner = team.owner_user_id === user._id;
    const isAdmin = await ctx.runQuery(internal.teamMembers.isTeamAdmin, {
      team_id: args.team_id,
      user_id: user._id,
    });

    if (!isTeamOwner && !isAdmin) throw new ConvexError("Unauthorized");

    const targetUser = await ctx.db
      .query("users")
      .withIndex("by_wallet_address", (q) => q.eq("wallet_address", getAddress(args.wallet_address)))
      .unique();

    if (!targetUser) throw new ConvexError("User not found");

    const existingMember = await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", targetUser._id))
      .unique();

    if (existingMember) throw new ConvexError("User is already a member of this team");

    await ctx.db.insert("team_members", {
      team_id: args.team_id,
      user_id: targetUser._id,
      role: args.role,
      added_by: user._id,
    });
  },
});

export const removeTeamMember = mutation({
  args: {
    team_id: v.id("teams"),
    user_id: v.id("users"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: args.accessToken })) as Doc<"users">;

    const team = await ctx.db.get(args.team_id);
    if (!team) throw new ConvexError("Team not found");

    const isTeamOwner = team.owner_user_id === user._id;
    const isAdmin = await ctx.runQuery(internal.teamMembers.isTeamAdmin, {
      team_id: args.team_id,
      user_id: user._id,
    });

    if (!isTeamOwner && !isAdmin) throw new ConvexError("Unauthorized");

    if (team.owner_user_id === args.user_id) throw new ConvexError("Cannot remove team owner");

    const member = await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", args.user_id))
      .unique();

    if (!member) throw new ConvexError("Member not found");

    await ctx.db.delete(member._id);
  },
});

export const changeTeamMemberRole = mutation({
  args: {
    team_id: v.id("teams"),
    user_id: v.id("users"),
    role: v.union(v.literal("member"), v.literal("admin")),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = (await ctx.runQuery(api.auth.getUserByAccessToken, { token: args.accessToken })) as Doc<"users">;

    const team = await ctx.db.get(args.team_id);
    if (!team) throw new ConvexError("Team not found");

    const isTeamOwner = team.owner_user_id === user._id;
    if (!isTeamOwner) throw new ConvexError("Only team owner can change member roles");

    if (team.owner_user_id === args.user_id) throw new ConvexError("Cannot change owner role");

    const member = await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", args.user_id))
      .unique();

    if (!member) throw new ConvexError("Member not found");

    await ctx.db.patch(member._id, { role: args.role });
  },
});

export const isTeamAdmin = internalQuery({
  args: { team_id: v.id("teams"), user_id: v.id("users") },
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", args.user_id))
      .unique();

    return member?.role === "admin";
  },
});

export const getTeamMemberCount = query({
  args: { team_id: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.team_id);
    if (!team) return 0;

    const members = await ctx.db
      .query("team_members")
      .withIndex("by_team", (q) => q.eq("team_id", args.team_id))
      .collect();

    return members.length + 1; // +1 for the owner
  },
});
