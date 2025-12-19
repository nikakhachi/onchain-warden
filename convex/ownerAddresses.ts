import { getAddress, recoverMessageAddress, isAddress } from "viem";
import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { CREATE_OWNER_ADDRESS_SIGN_MESSAGE } from "../src/app/constants";

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
  },
  handler: async (ctx, args): Promise<Id<"owner_addresses">> => {
    const signer = await recoverMessageAddress({
      message: CREATE_OWNER_ADDRESS_SIGN_MESSAGE,
      signature: args.signature as `0x${string}`,
    });

    if (getAddress(signer) !== getAddress(args.owner))
      throw new ConvexError("Invalid signature");

    return await ctx.runMutation(
      internal.ownerAddresses.createOwnerAddressInternal,
      {
        label: args.label,
        address: getAddress(args.address),
        owner: getAddress(signer),
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
