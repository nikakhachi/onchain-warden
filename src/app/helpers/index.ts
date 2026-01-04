import { SIGNATURE_EXPIRATION_TIME } from "../constants";
import { Event } from "../dashboard/create-alert/components/context/interfaces";

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

  if (input.type === "tuple" && input.components && input.components.length > 0) {
    // Recursively format each component
    const formattedComponents = input.components.map((component: any) => formatInput(component)).join(", ");

    // Return tuple format: (type1 name1, type2 name2) name
    return `(${formattedComponents}) ${indexed}${name}`.trim();
  }

  // Regular non-tuple type
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
      if (!input.components) {
        return {
          name,
          indexed: input.indexed,
          internalType: input.internalType,
          type: input.type,
        };
      } else {
        return input.components.map((component, idx) => ({
          name: `${name}.${component.name || `argument${idx}`}`,
          indexed: false,
          internalType: component.internalType,
          type: component.type,
        }));
      }
    })
    .flat();
};

export const normalizeDisplayConfig = (displayConfig: {
  timestamp: boolean;
  label: boolean;
  chain: boolean;
  contract_address: boolean;
  event_abi: boolean;
  explorer_link: boolean;
  layerzer_link: boolean;
  args: Array<{ key: string; label?: string; decimals?: number }>;
}) => ({
  ...displayConfig,
  args: displayConfig.args.map((arg) => ({
    ...arg,
    decimals: arg.decimals || 0,
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
