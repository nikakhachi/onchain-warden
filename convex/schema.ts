import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const event_watchers_condition_column = v.array(
  v.object({
    field: v.string(),
    operator: v.string(),
    value: v.string(),
  })
);

export const event_watchers_display_column = v.object({
  timestamp: v.boolean(),
  label: v.boolean(),
  chain: v.boolean(),
  contract_address: v.boolean(),
  event_abi: v.boolean(),
  explorer_link: v.boolean(),
  layerzer_link: v.boolean(),
  args: v.array(
    v.object({
      key: v.string(), // the key of the argument in the event that should be displayed
      decimals: v.optional(v.number()), // for numbers
      label: v.optional(v.string()), // displaying this instead of key
    })
  ),
});

export default defineSchema({
  chains: defineTable({
    name: v.string(),
    chain_id: v.number(),
  })
    .index("by_chain_id", ["chain_id"])
    .index("by_name", ["name"]),
  integrations: defineTable({
    name: v.string(),
    required_data: v.array(v.string()),
  }),
  owner_integrations: defineTable({
    label: v.string(),
    integration_id: v.id("integrations"),
    data: v.any(),
    owner: v.string(),
  }).index("by_owner", ["owner"]),
  event_watchers: defineTable({
    label: v.string(),
    owner_integration_ids: v.array(v.id("owner_integrations")),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    last_block: v.number(),
    owner: v.string(),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
  }).index("by_owner", ["owner"]),
  owner_addresses: defineTable({
    address: v.string(),
    label: v.string(),
    owner: v.string(),
  }).index("by_owner", ["owner"]),
  nonces: defineTable({
    nonce: v.string(),
  }).index("by_nonce", ["nonce"]),
  access_tokens: defineTable({
    token: v.string(),
    owner: v.string(),
    expires_at: v.number(),
    created_at: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_owner", ["owner"]),
});
