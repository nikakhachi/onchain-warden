export const formatAddress = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-4)}`;
};

export const generateSignature = (
  nonce: string,
  expiresAt: number
) => `Please sign to authenticate this action.

Expires: ${new Date(expiresAt).toISOString()}

Nonce: ${nonce}`;

export const generateSignatureData = () => {
  const nonce = crypto.randomUUID();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  const message = generateSignature(nonce, expiresAt);

  return {
    message,
    expiresAt,
    nonce,
  };
};
