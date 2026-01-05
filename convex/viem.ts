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

export const CHAIN_ID_TO_CHAIN: Record<
  number,
  {
    viemClient: PublicClient;
    name: string;
    blockExplorer: string;
    blockTime: number;
    chain: Chain;
    freeRpcList: string[];
  }
> = {
  [mainnet.id]: {
    viemClient: mainnetViemClient,
    name: mainnet.name,
    blockExplorer: mainnet.blockExplorers?.default.url,
    blockTime: mainnet.blockTime / 1000,
    chain: mainnet,
    freeRpcList: ["https://eth.drpc.org", "https://ethereum-rpc.publicnode.com"],
  },
  [base.id]: {
    viemClient: baseViemClient as PublicClient,
    name: base.name,
    blockExplorer: base.blockExplorers?.default.url,
    blockTime: base.blockTime / 1000,
    chain: base,
    freeRpcList: ["https://base.drpc.org", "https://base-rpc.publicnode.com"],
  },
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
    return await CHAIN_ID_TO_CHAIN[chainId].viemClient.getLogs({
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

export const getBlockNumber = async (chainId: number) => {
  const chainData = CHAIN_ID_TO_CHAIN[chainId];

  const rpcList = chainData.freeRpcList;

  if (!rpcList?.length) {
    handleError({ reason: `!rpcList?.length ${chainId}` });
    return chainData.viemClient.getBlockNumber();
  }

  for (const rpcUrl of rpcList) {
    try {
      if (!publicClientCache.has(rpcUrl)) {
        publicClientCache.set(rpcUrl, createPublicClient({ chain: chainData.chain, transport: http(rpcUrl) }));
      }
      const client = publicClientCache.get(rpcUrl)!;
      const blockNumber = await client.getBlockNumber();
      return blockNumber;
    } catch (error) {}
  }

  handleError({ reason: `All free RPCs failed for chain ${chainId}` });
  return chainData.viemClient.getBlockNumber();
};
