import { SIGNATURE_EXPIRATION_TIME } from "../constants";

export const formatAddress = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

export const generateSignature = (
  nonce: string,
  expiresAt: number
) => `Action: Authenticate

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

  if (
    input.type === "tuple" &&
    input.components &&
    input.components.length > 0
  ) {
    // Recursively format each component
    const formattedComponents = input.components
      .map((component: any) => formatInput(component))
      .join(", ");

    // Return tuple format: (type1 name1, type2 name2) name
    return `(${formattedComponents}) ${indexed} ${name}`.trim();
  }

  // Regular non-tuple type
  return `${input.type} ${indexed}${name}`.trim();
};

export const eventToAbi = (event: any) => {
  const inputs =
    event.inputs?.map((input: any) => formatInput(input)).join(", ") || "";

  return `event ${event.name}(${inputs})`;
};
