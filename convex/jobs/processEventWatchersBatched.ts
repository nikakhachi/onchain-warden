import { Address } from "viem";
import { v, ConvexError } from "convex/values";
import { getEventName } from "../../src/app/shared/helpers";
import { internalAction } from "../_generated/server";
import { handleError } from "../errors/handleError";
import { event_watcher_object, team_integration_object } from "../schema";
import { getLogs } from "../viem";
import { _processEvents } from "./processEvents";

export const main = internalAction({
  args: {
    event_watchers: v.array(
      v.object({
        ...event_watcher_object,
        _id: v.id("event_watchers"),
        _creationTime: v.number(),
      }),
    ),
    block_number: v.number(),
    chain_id: v.number(),
    team_addresses_mapped: v.record(v.string(), v.record(v.string(), v.string())),
    team_integrations: v.array(
      v.object({ ...team_integration_object, _id: v.id("team_integrations"), _creationTime: v.number() }),
    ),
  },
  handler: async (ctx, args) => {
    try {
      const contractAddress = args.event_watchers[0].contract_address;
      const lastBlock = args.event_watchers[0].last_block;

      // all watchers MUST have same contract address and same last block
      // Sanity checking
      if (
        args.event_watchers.some(
          (watcher) => watcher.contract_address !== contractAddress || watcher.last_block !== lastBlock,
        )
      ) {
        await handleError({ where: "processEventWatchersBatched Sanity Check" });
        throw new ConvexError("SANITY CHECK FAILED: processEventWatcherBatch");
      }

      const toBlock = BigInt(args.block_number);
      const fromBlock = BigInt(lastBlock + 1);

      const events = await getLogs(
        args.chain_id,
        contractAddress as Address,
        fromBlock,
        toBlock,
        args.event_watchers.map((w) => w.event_abi),
        {},
      );

      await Promise.all(
        args.event_watchers.map(async (eventWatcher) => {
          try {
            const filteredEvents = events.filter((event) => event.eventName === getEventName(eventWatcher.event_abi));
            await _processEvents(
              ctx,
              eventWatcher,
              filteredEvents,
              args.chain_id,
              args.team_addresses_mapped[eventWatcher.team_id],
              args.team_integrations,
            );
          } catch (error) {
            console.error("ERROR processEventWatchersBatched await Promise.all: ", error);
            await handleError({
              where: "processEventWatcherBatch await Promise.all",
              error,
              event_watcher_id: eventWatcher._id,
            });
          }
        }),
      );
    } catch (error: any) {
      console.error("ERROR processEventWatchersBatched: ", error);
      await handleError({ where: "processEventWatchersBatched general catch", error });
    }
  },
});
