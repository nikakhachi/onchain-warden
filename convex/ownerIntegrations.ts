import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAddress } from "viem";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";

export const getOwnerIntegrationById = query({
  args: { id: v.id("owner_integrations") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getOwnerIntegrationsByOwner = query({
  args: { owner: v.string() },
  handler: async (ctx, args) =>
    ctx.db
      .query("owner_integrations")
      .withIndex("by_owner", (q) => q.eq("owner", getAddress(args.owner)))
      .collect(),
});

export const createOwnerIntegration = mutation({
  args: {
    label: v.string(),
    integration_id: v.id("integrations"),
    data: v.any(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { owner } = await ctx.runQuery(internal.auth.validateToken, {
      token: args.accessToken,
    });

    const integration = await ctx.runQuery(
      api.integrations.getIntegrationById,
      { id: args.integration_id }
    );
    if (!integration) throw new ConvexError("Integration not found");

    _checkRequiredData(args.data, integration.required_data);

    await ctx.db.insert("owner_integrations", {
      label: args.label,
      integration_id: args.integration_id,
      data: args.data,
      owner: getAddress(owner),
    });
  },
});

export const updateOwnerIntegration = mutation({
  args: {
    id: v.id("owner_integrations"),
    label: v.string(),
    data: v.any(),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const { owner } = await ctx.runQuery(internal.auth.validateToken, {
      token: args.accessToken,
    });

    const existing = await ctx.runQuery(
      api.ownerIntegrations.getOwnerIntegrationById,
      { id: args.id }
    );

    if (!existing) throw new ConvexError("Integration not found");

    if (getAddress(existing.owner) !== getAddress(owner))
      throw new ConvexError("Unauthorized");

    const integration = await ctx.runQuery(
      api.integrations.getIntegrationById,
      { id: existing.integration_id }
    );
    if (!integration) throw new ConvexError("Integration not found");

    _checkRequiredData(args.data, integration.required_data);

    await ctx.db.patch(args.id, {
      label: args.label,
      data: args.data,
    });
  },
});

export const deleteOwnerIntegration = mutation({
  args: {
    id: v.id("owner_integrations"),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const { owner } = await ctx.runQuery(internal.auth.validateToken, {
      token: args.accessToken,
    });

    const existing = await ctx.runQuery(
      api.ownerIntegrations.getOwnerIntegrationById,
      { id: args.id }
    );

    if (!existing) throw new ConvexError("Integration not found");
    if (getAddress(existing.owner) !== getAddress(owner))
      throw new ConvexError("Unauthorized");

    await ctx.db.delete(args.id);
  },
});

const _checkRequiredData = (
  data: Record<string, any>,
  requiredData: string[]
) => {
  // Make sure data has all the required fields by the integration
  // Nothing more, nothing less

  if (Object.keys(data).length !== requiredData.length)
    throw new ConvexError("Invalid data");

  for (const requiredField of requiredData) {
    if (!data[requiredField])
      throw new ConvexError(`${requiredField} is missing`);
  }
};
