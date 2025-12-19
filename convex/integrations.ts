import { query } from "./_generated/server";
import { v } from "convex/values";

export const getIntegrations = query({
  args: {},
  handler: async (ctx) => ctx.db.query("integrations").collect(),
});

export const getIntegrationById = query({
  args: { id: v.id("integrations") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});
