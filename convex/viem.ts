import { createPublicClient, http, PublicClient } from "viem";
import { mainnet } from "viem/chains";

export const mainnetViemClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETHEREUM_RPC_URL),
});

export const CHAIN_ID_TO_VIEM_CLIENT: Record<number, PublicClient> = {
  [mainnet.id]: mainnetViemClient,
};

export const CHAIN_ID_TO_NAME: Record<number, string> = {
  [mainnet.id]: mainnet.name,
};

export const CHAIN_ID_TO_EXPLORER: Record<number, string> = {
  [mainnet.id]: mainnet.blockExplorers?.default.url,
};
