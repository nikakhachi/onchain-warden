import { Address } from "viem";
import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { handleError } from "../errors/handleError";
import { event_watcher_object, team_integration_object } from "../schema";
import { getLogs } from "../viem";
import { _processEvents } from "./processEvents";

export const main = internalAction({
  args: {
    event_watcher: v.object({
      ...event_watcher_object,
      _id: v.id("event_watchers"),
      _creationTime: v.number(),
    }),
    block_number: v.number(),
    chain_id: v.number(),
    addresses_mapped: v.record(v.string(), v.string()),
    team_integrations: v.array(
      v.object({ ...team_integration_object, _id: v.id("team_integrations"), _creationTime: v.number() }),
    ),
    watcher_integrations: v.array(
      v.object({
        event_watcher_id: v.id("event_watchers"),
        team_integration_id: v.id("team_integrations"),
        _id: v.id("watcher_integrations"),
        _creationTime: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      const toBlock = BigInt(args.block_number);
      const fromBlock = BigInt(args.event_watcher.last_block + 1);

      const getLogsConditions: Record<string, string> = {};

      args.event_watcher.condition.forEach((condition) => {
        if (condition.operator === "==") getLogsConditions[condition.field] = condition.value;
      });

      const events = await getLogs(
        args.chain_id,
        args.event_watcher.contract_address as Address,
        fromBlock,
        toBlock,
        [args.event_watcher.event_abi],
        getLogsConditions,
      );

      await _processEvents(
        ctx,
        args.event_watcher,
        events,
        args.chain_id,
        args.addresses_mapped,
        args.team_integrations,
        args.watcher_integrations,
      );
    } catch (error: any) {
      await handleError({
        where: "processEventWatcherIndividual general catch",
        error,
        event_watcher_id: args.event_watcher._id,
      });
    }
  },
});
