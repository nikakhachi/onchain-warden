import { Doc, Id, TableNames } from "../../../convex/_generated/dataModel";
import type { event_watchers_condition_column, event_watchers_display_column } from "../../../convex/schema";

type WithoutSystemFields<T> = Omit<T, "_id" | "_creationTime">;
type NakedDoc<TableName extends TableNames> = WithoutSystemFields<Doc<TableName>>;

export interface EventArg {
  name: string;
  type: string;
  indexed?: boolean;
  internalType?: string;
}

export type Condition = (typeof event_watchers_condition_column.type)[number] & {
  // Frontend-only fields
  type?: "standard" | "formula";
  formula?: string;
  required?: boolean;
};

export type DisplayConfig = typeof event_watchers_display_column.type;

export type CreateEventWatcherType = Omit<
  NakedDoc<"event_watchers">,
  "added_by" | "last_emit" | "is_active" | "last_block"
> & {
  team_integration_ids: Id<"team_integrations">[];
};

export type UpdateEventWatcherType = Omit<
  NakedDoc<"event_watchers">,
  "contract_address" | "chain_id" | "event_abi" | "last_block" | "is_active" | "added_by" | "team_id"
> & {
  id: Id<"event_watchers">;
  team_integration_ids: Id<"team_integrations">[];
};

export type SeverityType = Doc<"event_watchers">["severity"];

export type SimulateEventWatcherType = {
  contractAddress: string;
  chainId: number;
  eventAbi: string;
  conditions: (typeof event_watchers_condition_column.type)[number][];
  display: typeof event_watchers_display_column.type;
  label: string;
  severity: SeverityType;
};

export type CreateTeamIntegrationType = Omit<NakedDoc<"team_integrations">, "added_by">;
export type UpdateTeamIntegrationType = Omit<
  NakedDoc<"team_integrations">,
  "added_by" | "team_id" | "integration_id"
> & {
  id: Id<"team_integrations">;
};
export type CreateTeamAddressType = Omit<NakedDoc<"team_addresses">, "added_by">;
export type UpdateTeamAddressType = Omit<NakedDoc<"team_addresses">, "added_by" | "team_id"> & {
  id: Id<"team_addresses">;
};

export type RoleType = Doc<"team_members">["role"];
export type RoleWithoutOwnerType = Exclude<RoleType, "owner">;

export type IntegrationTypeId = Doc<"team_integrations">["integration_id"];
