/**
 * Shared types and interfaces used across create alert and edit watcher modal
 */

export interface EventArg {
  name: string;
  type: string;
  indexed?: boolean;
  internalType?: string;
}

export interface Condition {
  field: string;
  operator: string;
  value: string;
  type?: "standard" | "formula"; // "standard" is default for backward compatibility
  formula?: string; // For formula type: left side formula using event args
  required?: boolean;
}

export interface DisplayConfig {
  timestamp: boolean;
  label: boolean;
  chain: boolean;
  contract_address: boolean;
  event_abi: boolean;
  explorer_link: boolean;
  layerzer_link: boolean;
  args: Array<{ key: string; label?: string; decimals?: number; formula?: string }>;
  severity: boolean;
}
