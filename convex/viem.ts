import { AbiEvent, Address, Chain, createPublicClient, http, Log, parseAbiItem, PublicClient } from "viem";
import { mainnet, base } from "viem/chains";
import { handleError } from "./errors/handleError";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { ConvexError } from "convex/values";

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

const CHAIN_ID_TO_VIEM_CHAIN: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
};

export const getLogs = async (
  chainId: number,
  contractAddress: Address,
  fromBlock: bigint,
  toBlock: bigint,
  event: string,
  args: Record<string, string>,
  tryCount: number = 1,
): Promise<Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>[]> => {
  try {
    return await CHAIN_ID_TO_VIEM_CLIENT[chainId].getLogs({
      address: contractAddress,
      fromBlock,
      toBlock,
      event: parseAbiItem(event) as AbiEvent,
      args,
    });
  } catch (error) {
    if (tryCount > 2) {
      await handleError({ reason: `RPC Call Failed, max retries reached (tryCount: ${tryCount})`, error });
      throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
    }
    await handleError({ reason: `RPC Call Failed, retrying in 3 seconds.. (tryCount: ${tryCount})`, error });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    return await getLogs(chainId, contractAddress, fromBlock, toBlock, event, args, tryCount + 1);
  }
};

const publicClientCache = new Map<string, any>();

const CHAIN_ID_TO_FREE_RPC_LIST: Record<number, string[]> = {
  [mainnet.id]: ["https://eth.drpc.org", "https://ethereum-rpc.publicnode.com"],
  [base.id]: ["https://base.drpc.org", "https://base-rpc.publicnode.com"],
};

export const getBlockNumber = async (chainId: number) => {
  const rpcList = CHAIN_ID_TO_FREE_RPC_LIST[chainId];

  if (!rpcList?.length) {
    handleError({ reason: `!rpcList?.length ${chainId}` });
    return CHAIN_ID_TO_VIEM_CLIENT[chainId].getBlockNumber();
  }

  for (const rpcUrl of rpcList) {
    try {
      if (!publicClientCache.has(rpcUrl)) {
        publicClientCache.set(
          rpcUrl,
          createPublicClient({ chain: CHAIN_ID_TO_VIEM_CHAIN[chainId], transport: http(rpcUrl) }),
        );
      }
      const client = publicClientCache.get(rpcUrl)!;
      const blockNumber = await client.getBlockNumber();
      return blockNumber;
    } catch (error) {}
  }

  handleError({ reason: `All free RPCs failed for chain ${chainId}` });
  return CHAIN_ID_TO_VIEM_CLIENT[chainId].getBlockNumber();
};
