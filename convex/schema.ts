import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    owner_integration_ids: v.array(v.id("owner_integrations")),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    last_block: v.number(),
    owner: v.string(),
  }).index("by_owner", ["owner"]),
  owner_addresses: defineTable({
    address: v.string(),
    label: v.string(),
    owner: v.string(),
  }).index("by_owner", ["owner"]),
  event_watcher_templates: defineTable({
    protocol: v.string(),
    description: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
  })
    .index("by_protocol", ["protocol"])
    .index("by_chain_convex_id", ["chain_convex_id"]),
});
