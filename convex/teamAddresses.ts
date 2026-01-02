import { getAddress } from "viem";
import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { _mustBeTeamMember } from "./auth";

export const getAllTeamAddressesMapped = internalQuery({
  handler: async (ctx) => {
    const teamAddresses = await ctx.db.query("team_addresses").collect();

    const obj: Record<string, Record<string, string>> = {};

    teamAddresses.forEach((item) => {
      if (!obj[item.team_id]) obj[item.team_id] = {};

      obj[item.team_id][getAddress(item.address)] = item.label;
    });

    return obj;
  },
});

export const getTeamAddressesByTeamId = query({
  args: { team_id: v.id("teams"), accessToken: v.string() },
  handler: async (ctx, args) => {
    await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    return await ctx.db
      .query("team_addresses")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();
  },
});

export const createTeamAddress = mutation({
  args: {
    team_id: v.id("teams"),
    label: v.string(),
    address: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"team_addresses">> => {
    await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    return await ctx.db.insert("team_addresses", {
      label: args.label,
      address: getAddress(args.address),
      team_id: args.team_id,
    });
  },
});

export const updateTeamAddress = mutation({
  args: {
    id: v.id("team_addresses"),
    label: v.string(),
    address: v.string(),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const existingTeamAddress = await ctx.db.get(args.id);
    if (!existingTeamAddress) throw new ConvexError("-updateTeamAddress-");

    await _mustBeTeamMember(ctx, existingTeamAddress.team_id, args.accessToken);

    await ctx.db.patch(args.id, {
      label: args.label,
      address: getAddress(args.address),
    });
  },
});

export const deleteTeamAddress = mutation({
  args: {
    id: v.id("team_addresses"),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const existingTeamAddress = await ctx.db.get(args.id);
    if (!existingTeamAddress) throw new ConvexError("-deleteTeamAddress-");

    await _mustBeTeamMember(ctx, existingTeamAddress.team_id, args.accessToken);

    await ctx.db.delete(args.id);
  },
});
