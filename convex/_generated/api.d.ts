/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actionss_telegram from "../actionss/telegram.js";
import type * as chains from "../chains.js";
import type * as crons from "../crons.js";
import type * as eventSubscriptions from "../eventSubscriptions.js";
import type * as helpers_helpers from "../helpers/helpers.js";
import type * as metrics from "../metrics.js";
import type * as notify from "../notify.js";
import type * as taskDefinitions from "../taskDefinitions.js";
import type * as tasks from "../tasks.js";
import type * as user from "../user.js";
import type * as viem from "../viem.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actionss/telegram": typeof actionss_telegram;
  chains: typeof chains;
  crons: typeof crons;
  eventSubscriptions: typeof eventSubscriptions;
  "helpers/helpers": typeof helpers_helpers;
  metrics: typeof metrics;
  notify: typeof notify;
  taskDefinitions: typeof taskDefinitions;
  tasks: typeof tasks;
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
