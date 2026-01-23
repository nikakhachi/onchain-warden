import { SIGNATURE_EXPIRATION_TIME } from "./constants";
import { Event } from "../dashboard/create-alert/components/context/interfaces";
import { parseAbiItem } from "viem";
import { isAddress } from "viem";
import { EventArg, Condition, DisplayConfig } from "./types";

export const formatAddress = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

export const generateSignature = (nonce: string, expiresAt: number) => `Action: Authenticate

Expires: ${new Date(expiresAt).toISOString()}

Nonce: ${nonce}`;

export const generateSignatureData = () => {
  const nonce = crypto.randomUUID();
  const expiresAt = Date.now() + SIGNATURE_EXPIRATION_TIME;

  const message = generateSignature(nonce, expiresAt);

  return {
    message,
    expiresAt,
    nonce,
  };
};

const formatInput = (input: any): string => {
  const indexed = input.indexed ? "indexed " : "";
  const name = input.name || "";

  // Handle tuple/tuple[] with components
  if (input.type?.startsWith("tuple") && input.components?.length > 0) {
    const components = input.components.map((c: any) => `${c.type} ${c.name || ""}`.trim()).join(", ");
    const arrayNotation = input.type.replace("tuple", ""); // "" or "[]"
    return `(${components})${arrayNotation} ${indexed}${name}`.trim();
  }

  return `${input.type} ${indexed}${name}`.trim();
};

export const eventToAbi = (event: any) => {
  const inputs = event.inputs?.map((input: any) => formatInput(input)).join(", ") || "";

  return `event ${event.name}(${inputs})`;
};

export const eventToFormattedArgs = (event: Event) => {
  return event.inputs
    .map((input, idx) => {
      const name = input.name || `argument${idx}`;
      const isArray = input.type?.includes("[]") || false;
      // Expand tuples into dot notation: liquidVotes.farm, liquidVotes.weight
      if (input.type?.startsWith("tuple") && input.components?.length) {
        return input.components.map((c, i) => ({
          name: `${name}.${c.name || `argument${i}`}`,
          indexed: false,
          internalType: c.internalType,
          type: c.type,
          isArrayField: isArray, // tuple[] fields: display only, no conditions
        }));
      }
      // Mark ALL array types (uint256[], address[], etc.) as array fields
      return { name, indexed: input.indexed, internalType: input.internalType, type: input.type, isArrayField: isArray };
    })
    .flat();
};

export const normalizeDisplayConfig = (displayConfig: DisplayConfig) => ({
  ...displayConfig,
  args: displayConfig.args.map((arg) => ({
    ...arg,
    decimals: arg.decimals || 0,
    formula: arg.formula?.trim() || undefined, // Trim formula when saving (removes leading/trailing spaces)
  })),
});

export const fetchContractEvents = async ({
  contractAddress,
  chainId,
}: {
  contractAddress: string;
  chainId: number;
}) => {
  const url = new URL("/api/fetch-events", window.location.origin);
  url.searchParams.set("contract_address", contractAddress.trim());
  url.searchParams.set("chain_id", chainId.toString());

  const response = await fetch(url.toString());

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch events");
  }

  const { events } = await response.json();
  if (!Array.isArray(events) || events.length === 0) {
    throw new Error("No events found in contract ABI");
  }

  return events;
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

// ============================================================================
// Condition utilities
// ============================================================================

/**
 * Get available operators for a given argument type
 */
export function getOperators(argType: string): string[] {
  if (argType?.includes("uint") || argType?.includes("int")) {
    return ["==", "!=", ">", ">=", "<", "<=", "custom_formula", "rel"];
  }
  return ["==", "!="];
}

/**
 * Get human-readable label for an operator
 */
export function getOperatorLabel(op: string): string {
  const labels: Record<string, string> = {
    "==": "Equals",
    "!=": "Not Equals",
    ">": "Greater Than",
    ">=": "Greater Than or Equal",
    "<": "Less Than",
    "<=": "Less Than or Equal",
    custom_formula: "Custom Formula",
    rel: "Change in %",
  };
  return labels[op] || op;
}

/**
 * Validate a condition value based on the argument type
 * Returns an error message if invalid, undefined if valid
 */
export function getConditionError(condition: Condition, eventArgs: EventArg[]): string | undefined {
  if (!condition.field || !condition.value.trim()) {
    return undefined;
  }

  // Skip validation for custom formula conditions - they are validated separately
  if (condition.operator === "custom_formula") {
    return undefined;
  }

  // Validate "rel" operator as percentage (allows floats)
  if (condition.operator === "rel") {
    const value = condition.value.trim();
    // Allow decimal numbers for percentages (e.g., "10.5" for 10.5%)
    if (!/^\d+(\.\d+)?$/.test(value)) {
      return "Must be a valid percentage number (e.g., 10 or 10.5)";
    }
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      return "Must be a valid percentage number";
    }
    if (parsed < 0) {
      return "Percentage must be non-negative";
    }
    return undefined;
  }

  const selectedArg = eventArgs.find((a) => a.name === condition.field || a.internalType === condition.field);

  if (!selectedArg?.type) {
    return undefined;
  }

  const value = condition.value.trim();
  const argType = selectedArg.type;

  // Validate address type
  if (argType === "address") {
    if (!isAddress(value)) {
      return "Invalid EVM address format";
    }
  }
  // Validate uint/int types - must be valid integers
  else if (argType.includes("uint") || argType.includes("int")) {
    const numValue = value.startsWith("-") ? value.slice(1) : value;
    if (!/^\d+$/.test(numValue)) {
      return "Must be a valid number";
    }
    // Check if it's a valid integer within reasonable bounds
    try {
      const parsed = BigInt(value);
      if (argType.includes("uint") && parsed < BigInt(0)) {
        return "Must be a non-negative number";
      }
    } catch {
      return "Invalid number format";
    }
  }
  // Validate bytes types - must be valid hex string
  else if (argType.startsWith("bytes")) {
    if (!value.startsWith("0x")) {
      return "Must start with 0x";
    }
    const hexPart = value.slice(2);
    if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
      return "Invalid hex format";
    }
  }

  return undefined;
}

// ============================================================================
// Event utilities
// ============================================================================

/**
 * Extract event name from ABI string
 */
export function getEventName(abi: string): string {
  if (!abi) return "Unknown Event";
  try {
    const parsed = parseAbiItem(abi) as any;
    if (parsed.type === "event" && parsed.name) {
      return parsed.name;
    }
  } catch (e) {
    // Fallback to regex parsing
  }
  const match = abi.match(/event\s+(\w+)\s*\(/);
  return match ? match[1] : "Unknown Event";
}

/**
 * Parse event arguments from ABI string
 * Handles both standard ABI format and tuple arguments correctly
 */
export function parseEventArgs(abi: string): EventArg[] {
  if (!abi) return [];
  try {
    const parsed = parseAbiItem(abi) as Event;
    if (parsed.type === "event" && parsed.inputs) {
      // Use eventToFormattedArgs to handle tuple arguments correctly
      return eventToFormattedArgs(parsed);
    }
  } catch (e) {
    // If parseAbiItem fails (e.g., tuple format), try fallback parsing
    const match = abi.match(/\(([^)]+)\)/);
    if (match) {
      return match[1].split(",").map((arg, idx) => {
        const parts = arg.trim().split(" ");
        const type = parts[0] || "unknown";
        // Check if last part is a type (starts with lowercase) or a name
        const lastPart = parts[parts.length - 1];
        const isType = lastPart && /^(address|uint|int|bytes|bool|string)/.test(lastPart.toLowerCase());
        const name = isType ? `argument${idx}` : lastPart || `argument${idx}`;
        return { name, type, indexed: false };
      });
    }
  }
  return [];
}

// ============================================================================
// Display configuration utilities
// ============================================================================

/**
 * Get the current format type for an argument (decimals or formula)
 */
export function getFormatType(argConfig?: { decimals?: number; formula?: string }): "decimals" | "formula" {
  // If formula exists (even if empty string), use formula; otherwise use decimals
  return argConfig?.formula !== undefined && argConfig.formula !== null ? "formula" : "decimals";
}

/**
 * Handle format type change - ensures mutual exclusivity between decimals and formula
 */
export function handleFormatTypeChange(
  displayConfig: DisplayConfig,
  argName: string,
  formatType: "decimals" | "formula",
): DisplayConfig {
  return {
    ...displayConfig,
    args: displayConfig.args.map((arg) => {
      if (arg.key === argName) {
        if (formatType === "decimals") {
          // Switching to decimals: clear formula
          return { ...arg, formula: undefined };
        } else if (formatType === "formula") {
          // Switching to formula: clear decimals, keep formula (or set to empty string if none exists)
          return { ...arg, decimals: undefined, formula: arg.formula || "" };
        }
      }
      return arg;
    }),
  };
}

/**
 * Update argument configuration with proper mutual exclusivity
 */
export function updateArgConfig(
  displayConfig: DisplayConfig,
  argName: string,
  field: "label" | "decimals" | "formula",
  value: string | number | undefined,
): DisplayConfig {
  return {
    ...displayConfig,
    args: displayConfig.args.map((arg) => {
      if (arg.key === argName) {
        if (field === "decimals") {
          // When setting decimals, clear formula
          return { ...arg, decimals: value as number | undefined, formula: undefined };
        } else if (field === "formula") {
          // When setting formula, clear decimals
          return { ...arg, formula: value as string | undefined, decimals: undefined };
        } else if (field === "label") {
          // When setting label, ensure it's a string
          return { ...arg, label: value as string | undefined };
        }
        return arg;
      }
      return arg;
    }),
  };
}

/**
 * Toggle argument display (add/remove from args array)
 */
export function toggleArgDisplay(displayConfig: DisplayConfig, argName: string): DisplayConfig {
  const existing = displayConfig.args.find((a) => a.key === argName);
  if (existing) {
    // Remove from args
    return {
      ...displayConfig,
      args: displayConfig.args.filter((a) => a.key !== argName),
    };
  } else {
    // Add to args
    return {
      ...displayConfig,
      args: [...displayConfig.args, { key: argName, label: "", decimals: undefined, formula: undefined }],
    };
  }
}
