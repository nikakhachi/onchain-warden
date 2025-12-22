import { getAddress, recoverMessageAddress } from "viem";
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { CREATE_OWNER_ADDRESS_SIGN_MESSAGE } from "../src/app/constants";

export const getAllOwnerAddressesMapped = query({
  handler: async (ctx) => {
    const ownerAddresses = await ctx.db.query("owner_addresses").collect();

    const obj: Record<string, Record<string, string>> = {};

    ownerAddresses.forEach((item) => {
      const ownerAddress = getAddress(item.owner);

      if (!obj[ownerAddress]) obj[ownerAddress] = {};

      obj[ownerAddress][getAddress(item.address)] = item.label;
    });

    return obj;
  },
});

export const getOwnerAddressById = query({
  args: { id: v.id("owner_addresses") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getOwnerAddressessByOwner = query({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("owner_addresses")
      .withIndex("by_owner", (q) => q.eq("owner", getAddress(args.owner)))
      .collect();
  },
});

export const createOwnerAddressAction = action({
  args: {
    label: v.string(),
    address: v.string(),
    owner: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"owner_addresses">> => {
    await ctx.runAction(internal.nonces.validateSignature, {
      owner: args.owner,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    });

    return await ctx.runMutation(
      internal.ownerAddresses.createOwnerAddressInternal,
      {
        label: args.label,
        address: getAddress(args.address),
        owner: getAddress(args.owner),
      }
    );
  },
});

export const createOwnerAddressInternal = internalMutation({
  args: {
    label: v.string(),
    address: v.string(),
    owner: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("owner_addresses", args);
  },
});

export const updateOwnerAddressAction = action({
  args: {
    id: v.id("owner_addresses"),
    label: v.string(),
    address: v.string(),
    owner: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runAction(internal.nonces.validateSignature, {
      owner: args.owner,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    });

    const existing = await ctx.runQuery(
      api.ownerAddresses.getOwnerAddressById,
      {
        id: args.id,
      }
    );

    if (!existing) throw new ConvexError("Address not found");
    if (getAddress(existing.owner) !== getAddress(args.owner))
      throw new ConvexError("Unauthorized");

    await ctx.runMutation(internal.ownerAddresses.updateOwnerAddressInternal, {
      id: args.id,
      label: args.label,
      address: getAddress(args.address),
    });
  },
});

export const updateOwnerAddressInternal = internalMutation({
  args: {
    id: v.id("owner_addresses"),
    label: v.string(),
    address: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      label: args.label,
      address: args.address,
    });
  },
});

export const deleteOwnerAddressAction = action({
  args: {
    id: v.id("owner_addresses"),
    owner: v.string(),
    signature: v.string(),
    expiresAt: v.number(),
    nonce: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runAction(internal.nonces.validateSignature, {
      owner: args.owner,
      signature: args.signature,
      expiresAt: args.expiresAt,
      nonce: args.nonce,
    });

    const existing = await ctx.runQuery(
      api.ownerAddresses.getOwnerAddressById,
      {
        id: args.id,
      }
    );

    if (!existing) throw new ConvexError("Address not found");
    if (getAddress(existing.owner) !== getAddress(args.owner))
      throw new ConvexError("Unauthorized");

    await ctx.runMutation(internal.ownerAddresses.deleteOwnerAddressInternal, {
      id: args.id,
    });
  },
});

export const deleteOwnerAddressInternal = internalMutation({
  args: {
    id: v.id("owner_addresses"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
