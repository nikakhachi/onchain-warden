import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { getAddress } from "viem";

export const getUsersTasks = query({
  args: {
    wallet_address: v.string(),
  },
  handler: async (ctx, args) => {
    const eventTasks = await ctx.db
      .query("event_tasks")
      .filter((q) => q.eq(q.field("owner"), getAddress(args.wallet_address)))
      .collect();

    const userTasks: any[] = [];

    for (const eventTask of eventTasks) {
      const taskDefinition = await ctx.db
        .query("task_definitions")
        .filter((q) => q.eq(q.field("_id"), eventTask.task_definition_id))
        .first();

      if (!taskDefinition) throw new ConvexError("Task definition not found");

      const chain = await ctx.db.get(eventTask.chain_convex_id);

      userTasks.push({
        eventTask,
        taskDefinition,
        chain,
      });
    }

    return userTasks;
  },
});
