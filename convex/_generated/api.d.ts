/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as auth_node from "../auth_node.js";
import type * as chains from "../chains.js";
import type * as crons from "../crons.js";
import type * as errors_handleError from "../errors/handleError.js";
import type * as eventWatchers from "../eventWatchers.js";
import type * as helpers_buildText from "../helpers/buildText.js";
import type * as helpers_checkAgainstConditions from "../helpers/checkAgainstConditions.js";
import type * as helpers_formatNumber from "../helpers/formatNumber.js";
import type * as helpers_getValueFromEventArgs from "../helpers/getValueFromEventArgs.js";
import type * as integrations from "../integrations.js";
import type * as integrations_discord from "../integrations/discord.js";
import type * as integrations_telegram from "../integrations/telegram.js";
import type * as jobs_eventWatchers from "../jobs/eventWatchers.js";
import type * as metrics from "../metrics.js";
import type * as nonces from "../nonces.js";
import type * as ownerAddresses from "../ownerAddresses.js";
import type * as ownerIntegrations from "../ownerIntegrations.js";
import type * as user from "../user.js";
import type * as viem from "../viem.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  auth_node: typeof auth_node;
  chains: typeof chains;
  crons: typeof crons;
  "errors/handleError": typeof errors_handleError;
  eventWatchers: typeof eventWatchers;
  "helpers/buildText": typeof helpers_buildText;
  "helpers/checkAgainstConditions": typeof helpers_checkAgainstConditions;
  "helpers/formatNumber": typeof helpers_formatNumber;
  "helpers/getValueFromEventArgs": typeof helpers_getValueFromEventArgs;
  integrations: typeof integrations;
  "integrations/discord": typeof integrations_discord;
  "integrations/telegram": typeof integrations_telegram;
  "jobs/eventWatchers": typeof jobs_eventWatchers;
  metrics: typeof metrics;
  nonces: typeof nonces;
  ownerAddresses: typeof ownerAddresses;
  ownerIntegrations: typeof ownerIntegrations;
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
