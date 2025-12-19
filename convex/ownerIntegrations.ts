import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAddress, recoverMessageAddress } from "viem";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { CREATE_OWNER_INTEGRATION_SIGN_MESSAGE } from "../src/app/constants";

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

export const createOwnerIntegrationAction = action({
  args: {
    label: v.string(),
    integration_id: v.id("integrations"),
    data: v.any(),
    owner: v.string(),
    signature: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"owner_integrations">> => {
    const signer = await recoverMessageAddress({
      message: CREATE_OWNER_INTEGRATION_SIGN_MESSAGE,
      signature: args.signature as `0x${string}`,
    });

    if (getAddress(signer) !== getAddress(args.owner))
      throw new ConvexError("Invalid signature");

    const integration = await ctx.runQuery(
      api.integrations.getIntegrationById,
      { id: args.integration_id }
    );
    if (!integration) throw new ConvexError("Integration not found");

    for (const requiredField of integration.required_data) {
      if (!args.data[requiredField]) {
        throw new ConvexError(
          `${requiredField} is required for ${integration.name} integration`
        );
      }
    }

    return await ctx.runMutation(
      internal.ownerIntegrations.createOwnerIntegrationInternal,
      {
        label: args.label,
        integration_id: args.integration_id,
        data: args.data,
        owner: getAddress(signer),
      }
    );
  },
});

export const createOwnerIntegrationInternal = internalMutation({
  args: {
    label: v.string(),
    integration_id: v.id("integrations"),
    data: v.any(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("owner_integrations", args);
  },
});
