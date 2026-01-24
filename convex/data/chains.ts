export const CHAINS: Record<number, { name: string } | undefined> = {
  1: {
    name: "Ethereum",
  },
  8453: {
    name: "Base",
  },
  56: {
    name: "BNB Smart Chain",
  },
  43114: {
    name: "Avalanche",
  },
};

export const CHAINS_LIST = Object.keys(CHAINS).map((key) => ({
  id: Number(key),
  // @ts-ignore
  name: CHAINS[Number(key)].name,
}));
