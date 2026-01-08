import { AbiEvent, Address, Chain, createPublicClient, http, Log, parseAbi, parseAbiItem, PublicClient } from "viem";
import { mainnet, base } from "viem/chains";
import { handleError } from "./errors/handleError";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { ConvexError } from "convex/values";

export const CHAIN_ID_TO_CHAIN: Record<
  number,
  {
    name: string;
    blockExplorer: string;
    blockTime: number;
    chain: Chain;
    publicRpcList: string[];
    privateRpcList: string[];
  }
> = {
  [mainnet.id]: {
    name: mainnet.name,
    blockExplorer: mainnet.blockExplorers?.default.url,
    blockTime: mainnet.blockTime / 1000,
    chain: mainnet,
    publicRpcList: ["https://eth.drpc.org", "https://ethereum-rpc.publicnode.com"],
    privateRpcList: [
      `https://lb.drpc.live/ethereum/${process.env.DRPC_FREE_RPC_KEY_1}`,
      `https://lb.drpc.live/ethereum/${process.env.DRPC_FREE_RPC_KEY_2}`,
      `https://lb.drpc.live/ethereum/${process.env.DRPC_PAID_RPC_KEY}`,
    ],
  },
  [base.id]: {
    name: base.name,
    blockExplorer: base.blockExplorers?.default.url,
    blockTime: base.blockTime / 1000,
    chain: base,
    publicRpcList: ["https://base.drpc.org", "https://base-rpc.publicnode.com"],
    privateRpcList: [
      `https://lb.drpc.live/base/${process.env.DRPC_FREE_RPC_KEY_1}`,
      `https://lb.drpc.live/base/${process.env.DRPC_FREE_RPC_KEY_2}`,
      `https://lb.drpc.live/base/${process.env.DRPC_PAID_RPC_KEY}`,
    ],
  },
};

const clientCache = new Map<string, PublicClient>();

const getOrCreateClient = (rpcUrl: string, chain: Chain): PublicClient => {
  if (!clientCache.has(rpcUrl)) {
    clientCache.set(
      rpcUrl,
      createPublicClient({
        chain,
        transport: http(rpcUrl, { retryCount: 2 }),
      }),
    );
  }

  return clientCache.get(rpcUrl)!;
};

export const getLogs = async (
  chainId: number,
  contractAddress: Address,
  fromBlock: bigint,
  toBlock: bigint,
  events: string[],
  args: Record<string, string>,
  useFreeRpcs: boolean = false,
): Promise<Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>[]> => {
  const chainData = CHAIN_ID_TO_CHAIN[chainId];

  const rpcList = useFreeRpcs
    ? [...chainData.publicRpcList, ...chainData.privateRpcList]
    : [...chainData.privateRpcList];

  for (const rpcUrl of rpcList) {
    try {
      const client = getOrCreateClient(rpcUrl, chainData.chain);

      const obj = { address: contractAddress, fromBlock, toBlock };

      if (events.length === 1) {
        return await client.getLogs({ ...obj, event: parseAbiItem(events[0]) as AbiEvent, args });
      } else {
        return await client.getLogs({ ...obj, events: parseAbi(events) });
      }
    } catch (error) {
      await handleError({ reason: `getLogs failed for ${rpcUrl}. Retrying with next RPC...`, error });
    }
  }

  await handleError({ reason: `All private RPCs failed for getLogs on chain ${chainId}` });
  throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
};

export const getBlockNumber = async (chainId: number): Promise<bigint> => {
  const chainData = CHAIN_ID_TO_CHAIN[chainId];

  const rpcList = [...chainData.publicRpcList, ...chainData.privateRpcList];

  if (!rpcList?.length) {
    handleError({ reason: `!rpcList?.length ${chainId}` });
    throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
  }

  for (const rpcUrl of rpcList) {
    try {
      const client = getOrCreateClient(rpcUrl, chainData.chain);
      return await client.getBlockNumber();
    } catch (error) {
      await handleError({ reason: `getBlockNumber failed for ${rpcUrl}. Retrying with next RPC...`, error });
    }
  }

  handleError({ reason: `All RPCs failed for getBlockNumber on chain ${chainId}` });
  throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
};
