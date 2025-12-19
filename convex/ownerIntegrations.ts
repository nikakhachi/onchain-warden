import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAddress } from "viem";

export const getOwnerIntegrationById = query({
  args: { id: v.id("owner_integrations") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getOwnerIntegrationsByOwner = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("owner_integrations")
      .withIndex("by_owner", (q) => q.eq("owner", getAddress(args.owner)))
      .collect();
  },
});

export const createOwnerIntegration = mutation({
  args: {
    label: v.string(),
    integration_id: v.id("integrations"),
    data: v.any(),
    owner: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("owner_integrations", args),
});
