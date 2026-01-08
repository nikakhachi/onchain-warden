import { ConvexError, v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { getAddress } from "viem";
import { _mustBeTeamAdmin, _mustBeTeamMember, _mustBeTeamOwner } from "./auth";
import { Doc } from "./_generated/dataModel";
import { ERROR_MESSAGES } from "./errors/errorMessages";

export const getTeamMembersByTeamId = query({
  args: { team_id: v.id("teams"), accessToken: v.string() },
  handler: async (ctx, args) => {
    await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    const teamMembers = await ctx.db
      .query("team_members")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
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
    wallet_address: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.union(v.literal("member"), v.literal("admin")),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { user, team } = await _mustBeTeamAdmin(ctx, args.team_id, args.accessToken);

    if (team.is_personal) throw new ConvexError(ERROR_MESSAGES.NOT_ALLOWED_FOR_PERSONAL_TEAM);

    let targetUser: Doc<"users"> | undefined | null;

    if (args.email) {
      targetUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
    }
    if (args.wallet_address) {
      targetUser = await ctx.db
        .query("users")
        .withIndex("by_wallet_address", (q) => q.eq("wallet_address", getAddress(args.wallet_address!)))
        .unique();
    }

    if (!targetUser) throw new ConvexError(ERROR_MESSAGES.USER_TO_ADD_NOT_FOUND);

    const existingMember = await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", targetUser._id))
      .unique();

    if (existingMember) throw new ConvexError(ERROR_MESSAGES.USER_ALREADY_MEMBER);

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
    const { member, team } = await _mustBeTeamAdmin(ctx, args.team_id, args.accessToken);

    if (team.is_personal) throw new ConvexError(ERROR_MESSAGES.NOT_ALLOWED_FOR_PERSONAL_TEAM);

    const targetMember = await ctx.runQuery(internal.teamMembers.getTeamMember, {
      team_id: args.team_id,
      user_id: args.user_id,
    });

    if (!targetMember) throw new ConvexError(ERROR_MESSAGES.MEMBER_NOT_FOUND);
    if (targetMember.role === "owner") throw new ConvexError(ERROR_MESSAGES.CANNOT_REMOVE_TEAM_OWNER);
    if (member.role !== "owner" && targetMember.role === "admin")
      throw new ConvexError(ERROR_MESSAGES.CANNOT_REMOVE_TEAM_ADMIN);

    await ctx.db.delete(targetMember._id);
  },
});

export const leaveTeam = mutation({
  args: {
    team_id: v.id("teams"),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { member, team } = await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    if (member.role === "owner" || team.is_personal) throw new ConvexError(ERROR_MESSAGES.CANNOT_REMOVE_TEAM_OWNER);

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
    const { team } = await _mustBeTeamOwner(ctx, args.team_id, args.accessToken);

    if (team.is_personal) throw new ConvexError(ERROR_MESSAGES.NOT_ALLOWED_FOR_PERSONAL_TEAM);

    const member = await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", args.user_id))
      .unique();

    if (!member) throw new ConvexError(ERROR_MESSAGES.MEMBER_NOT_FOUND);
    if (member.role === "owner") throw new ConvexError(ERROR_MESSAGES.CANNOT_CHANGE_OWNER_ROLE);

    await ctx.db.patch(member._id, { role: args.role });
  },
});

export const getTeamMemberCount = query({
  args: { team_id: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.team_id);
    if (!team) return 0;

    const members = await ctx.db
      .query("team_members")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();

    return members.length;
  },
});

export const getTeamMember = internalQuery({
  args: { team_id: v.id("teams"), user_id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("team_members")
      .withIndex("by_team_and_user", (q) => q.eq("team_id", args.team_id).eq("user_id", args.user_id))
      .unique();
  },
});

export const getUserRoleInTeam = query({
  args: { team_id: v.id("teams"), accessToken: v.string() },
  handler: async (ctx, args) => {
    const { user, team, member } = (await _mustBeTeamMember(ctx, args.team_id, args.accessToken)) as {
      user: Doc<"users">;
      team: Doc<"teams">;
      member: Doc<"team_members"> | null;
    };

    if (member) return member.role;
  },
});
