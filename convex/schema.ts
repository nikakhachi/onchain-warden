//
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  chains: defineTable({
    name: v.string(),
    chain_id: v.number(),
  })
    .index("by_chain_id", ["chain_id"])
    .index("by_name", ["name"]),
  event_subscriptions: defineTable({
    chain: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
  }),
  task_definitions: defineTable({
    name: v.string(),
    required_data: v.array(v.string()),
  }),
  tasks: defineTable({
    task_definition_id: v.id("task_definitions"),
    event_subscription_id: v.id("event_subscriptions"),
    data: v.any(),
    last_block: v.number(),
    signer: v.string(),
  }),
});
