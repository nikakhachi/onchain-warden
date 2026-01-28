import { mainnet, base, bsc, avalanche, arbitrum, Chain } from "viem/chains";

export const CHAINS_LIST = [mainnet, base, bsc, avalanche, arbitrum];

export const CHAINS_MAP = CHAINS_LIST.reduce((acc: Record<number, Chain>, chain) => {
  acc[chain.id] = chain;
  return acc;
}, {});
