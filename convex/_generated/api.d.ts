/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as chains from "../chains.js";
import type * as crons from "../crons.js";
import type * as eventTasks from "../eventTasks.js";
import type * as helpers_index from "../helpers/index.js";
import type * as metrics from "../metrics.js";
import type * as taskDefinitions from "../taskDefinitions.js";
import type * as tasks_actions_telegram from "../tasks/actions/telegram.js";
import type * as tasks_eventTasks from "../tasks/eventTasks.js";
import type * as user from "../user.js";
import type * as viem from "../viem.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  chains: typeof chains;
  crons: typeof crons;
  eventTasks: typeof eventTasks;
  "helpers/index": typeof helpers_index;
  metrics: typeof metrics;
  taskDefinitions: typeof taskDefinitions;
  "tasks/actions/telegram": typeof tasks_actions_telegram;
  "tasks/eventTasks": typeof tasks_eventTasks;
  user: typeof user;
  viem: typeof viem;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
