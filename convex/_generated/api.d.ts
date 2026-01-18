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
import type * as crons from "../crons.js";
import type * as data_chains from "../data/chains.js";
import type * as data_integrations from "../data/integrations.js";
import type * as data_severities from "../data/severities.js";
import type * as errors_errorMessages from "../errors/errorMessages.js";
import type * as errors_handleError from "../errors/handleError.js";
import type * as eventWatchers from "../eventWatchers.js";
import type * as helpers_buildText from "../helpers/buildText.js";
import type * as helpers_checkAgainstConditions from "../helpers/checkAgainstConditions.js";
import type * as helpers_checkIfComparesToLastEmit from "../helpers/checkIfComparesToLastEmit.js";
import type * as helpers_formatNumber from "../helpers/formatNumber.js";
import type * as helpers_formulaUtils from "../helpers/formulaUtils.js";
import type * as helpers_getValueFromEventArgs from "../helpers/getValueFromEventArgs.js";
import type * as helpers_handleAlertEvent from "../helpers/handleAlertEvent.js";
import type * as http from "../http.js";
import type * as integrations_discord from "../integrations/discord.js";
import type * as integrations_slack from "../integrations/slack.js";
import type * as integrations_telegram from "../integrations/telegram.js";
import type * as jobs_eventWatchers from "../jobs/eventWatchers.js";
import type * as jobs_processEventWatcherIndividual from "../jobs/processEventWatcherIndividual.js";
import type * as jobs_processEventWatchersBatched from "../jobs/processEventWatchersBatched.js";
import type * as jobs_processEvents from "../jobs/processEvents.js";
import type * as metrics from "../metrics.js";
import type * as nonces from "../nonces.js";
import type * as team from "../team.js";
import type * as teamAddresses from "../teamAddresses.js";
import type * as teamIntegrations from "../teamIntegrations.js";
import type * as teamMembers from "../teamMembers.js";
import type * as users from "../users.js";
import type * as viem from "../viem.js";
import type * as waitlist from "../waitlist.js";
import type * as watcherIntegrations from "../watcherIntegrations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  auth_node: typeof auth_node;
  crons: typeof crons;
  "data/chains": typeof data_chains;
  "data/integrations": typeof data_integrations;
  "data/severities": typeof data_severities;
  "errors/errorMessages": typeof errors_errorMessages;
  "errors/handleError": typeof errors_handleError;
  eventWatchers: typeof eventWatchers;
  "helpers/buildText": typeof helpers_buildText;
  "helpers/checkAgainstConditions": typeof helpers_checkAgainstConditions;
  "helpers/checkIfComparesToLastEmit": typeof helpers_checkIfComparesToLastEmit;
  "helpers/formatNumber": typeof helpers_formatNumber;
  "helpers/formulaUtils": typeof helpers_formulaUtils;
  "helpers/getValueFromEventArgs": typeof helpers_getValueFromEventArgs;
  "helpers/handleAlertEvent": typeof helpers_handleAlertEvent;
  http: typeof http;
  "integrations/discord": typeof integrations_discord;
  "integrations/slack": typeof integrations_slack;
  "integrations/telegram": typeof integrations_telegram;
  "jobs/eventWatchers": typeof jobs_eventWatchers;
  "jobs/processEventWatcherIndividual": typeof jobs_processEventWatcherIndividual;
  "jobs/processEventWatchersBatched": typeof jobs_processEventWatchersBatched;
  "jobs/processEvents": typeof jobs_processEvents;
  metrics: typeof metrics;
  nonces: typeof nonces;
  team: typeof team;
  teamAddresses: typeof teamAddresses;
  teamIntegrations: typeof teamIntegrations;
  teamMembers: typeof teamMembers;
  users: typeof users;
  viem: typeof viem;
  waitlist: typeof waitlist;
  watcherIntegrations: typeof watcherIntegrations;
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
