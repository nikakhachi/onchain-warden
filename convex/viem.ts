import { createPublicClient, http, PublicClient } from "viem";
import { mainnet, base } from "viem/chains";

export const mainnetViemClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

export const baseViemClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
});

export const CHAIN_ID_TO_VIEM_CLIENT: Record<number, PublicClient> = {
  [mainnet.id]: mainnetViemClient,
  [base.id]: baseViemClient as PublicClient,
};

export const CHAIN_ID_TO_NAME: Record<number, string> = {
  [mainnet.id]: mainnet.name,
  [base.id]: base.name,
};

export const CHAIN_ID_TO_EXPLORER: Record<number, string> = {
  [mainnet.id]: mainnet.blockExplorers?.default.url,
  [base.id]: base.blockExplorers?.default.url,
};

export const CHAIN_ID_TO_BLOCK_SECONDS: Record<number, number> = {
  [mainnet.id]: mainnet.blockTime / 1000,
  [base.id]: base.blockTime / 1000,
};
