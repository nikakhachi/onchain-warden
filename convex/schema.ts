import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const event_watchers_condition_column = v.array(
  v.object({
    field: v.string(),
    operator: v.string(),
    value: v.string(),
  }),
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
    }),
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
  users: defineTable({
    wallet_address: v.string(),
    username: v.string(),
  })
    .index("by_wallet_address", ["wallet_address"])
    .index("by_username", ["username"]),
  teams: defineTable({
    name: v.string(),
  }),
  team_members: defineTable({
    team_id: v.id("teams"),
    user_id: v.id("users"),
    role: v.union(v.literal("member"), v.literal("admin"), v.literal("owner")),
    added_by: v.id("users"),
  })
    .index("by_team_id", ["team_id"])
    .index("by_user_id", ["user_id"])
    .index("by_role", ["role"])
    .index("by_team_and_user", ["team_id", "user_id"]),
  team_integrations: defineTable({
    label: v.string(),
    integration_id: v.id("integrations"),
    data: v.any(),
    team_id: v.id("teams"),
  }).index("by_team_id", ["team_id"]),
  event_watchers: defineTable({
    label: v.string(),
    chain_convex_id: v.id("chains"),
    contract_address: v.string(),
    event_abi: v.string(),
    last_block: v.number(),
    team_id: v.id("teams"),
    condition: event_watchers_condition_column,
    display: event_watchers_display_column,
  }).index("by_team_id", ["team_id"]),
  watcher_integrations: defineTable({
    event_watcher_id: v.id("event_watchers"),
    team_integration_id: v.id("team_integrations"),
  })
    .index("by_event_watcher_id", ["event_watcher_id"])
    .index("by_team_integration_id", ["team_integration_id"]),
  team_addresses: defineTable({
    address: v.string(),
    label: v.string(),
    team_id: v.id("teams"),
  }).index("by_team_id", ["team_id"]),
  nonces: defineTable({
    nonce: v.string(),
  }).index("by_nonce", ["nonce"]),
  access_tokens: defineTable({
    token: v.string(),
    user_id: v.id("users"),
    expires_at: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user_id", ["user_id"]),
});
