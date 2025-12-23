import { SIGNATURE_EXPIRATION_TIME } from "../constants";

export const formatAddress = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

export const generateSignature = (
  nonce: string,
  expiresAt: number
) => `Please sign to log in.

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
