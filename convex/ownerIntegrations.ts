import { query } from "./_generated/server";
import { v } from "convex/values";

export const getOwnerIntegrationById = query({
  args: { id: v.id("owner_integrations") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});
