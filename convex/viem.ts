import { AbiEvent, Address, Chain, createPublicClient, http, Log, parseAbi, parseAbiItem, PublicClient } from "viem";
import { mainnet, base, bsc, avalanche } from "viem/chains";
import { handleError } from "./errors/handleError";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { ConvexError } from "convex/values";

interface IChain {
  name: string;
  blockExplorer: string;
  blockTime: number;
  chain: Chain;
  publicRpcList: string[];
  privateFreeRpcList: string[];
  privatePaidRpc: string;
}

export const CHAIN_ID_TO_CHAIN: Record<number, IChain> = {
  [mainnet.id]: {
    name: mainnet.name,
    blockExplorer: mainnet.blockExplorers?.default.url,
    blockTime: mainnet.blockTime / 1000,
    chain: mainnet,
    publicRpcList: ["https://eth.drpc.org", "https://ethereum-rpc.publicnode.com"],
    privateFreeRpcList: [
      `https://lb.drpc.live/ethereum/${process.env.DRPC_FREE_RPC_KEY_1}`,
      `https://lb.drpc.live/ethereum/${process.env.DRPC_FREE_RPC_KEY_2}`,
    ],
    privatePaidRpc: `https://lb.drpc.live/ethereum/${process.env.DRPC_PAID_RPC_KEY}`,
  },
  [base.id]: {
    name: base.name,
    blockExplorer: base.blockExplorers?.default.url,
    blockTime: base.blockTime / 1000,
    chain: base,
    publicRpcList: ["https://base.drpc.org", "https://base-rpc.publicnode.com"],
    privateFreeRpcList: [
      `https://lb.drpc.live/base/${process.env.DRPC_FREE_RPC_KEY_1}`,
      `https://lb.drpc.live/base/${process.env.DRPC_FREE_RPC_KEY_2}`,
    ],
    privatePaidRpc: `https://lb.drpc.live/base/${process.env.DRPC_PAID_RPC_KEY}`,
  },
  [bsc.id]: {
    name: bsc.name,
    blockExplorer: bsc.blockExplorers?.default.url,
    blockTime: bsc.blockTime / 1000,
    chain: bsc,
    publicRpcList: ["https://bsc.drpc.org", "https://bsc-rpc.publicnode.com"],
    privateFreeRpcList: [
      `https://lb.drpc.live/bsc/${process.env.DRPC_FREE_RPC_KEY_1}`,
      `https://lb.drpc.live/bsc/${process.env.DRPC_FREE_RPC_KEY_2}`,
    ],
    privatePaidRpc: `https://lb.drpc.live/bsc/${process.env.DRPC_PAID_RPC_KEY}`,
  },
  [avalanche.id]: {
    name: avalanche.name,
    blockExplorer: avalanche.blockExplorers?.default.url,
    blockTime: avalanche.blockTime / 1000,
    chain: avalanche,
    publicRpcList: ["https://avalanche.drpc.org", "https://avalanche-c-chain-rpc.publicnode.com"],
    privateFreeRpcList: [
      `https://lb.drpc.live/avalanche/${process.env.DRPC_FREE_RPC_KEY_1}`,
      `https://lb.drpc.live/avalanche/${process.env.DRPC_FREE_RPC_KEY_2}`,
    ],
    privatePaidRpc: `https://lb.drpc.live/avalanche/${process.env.DRPC_PAID_RPC_KEY}`,
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

  const randomOffset = Math.floor(Math.random() * chainData.privateFreeRpcList.length);
  const rotatedPrivateFreeRpcs = [
    ...chainData.privateFreeRpcList.slice(randomOffset),
    ...chainData.privateFreeRpcList.slice(0, randomOffset),
  ];

  const rpcList = useFreeRpcs
    ? [...chainData.publicRpcList, ...rotatedPrivateFreeRpcs, chainData.privatePaidRpc]
    : [...rotatedPrivateFreeRpcs, chainData.privatePaidRpc];

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
      await handleError({ reason: `getLogs: ${getRpcData(chainData, rpcUrl)}. Retrying..`, error });
    }
  }

  await handleError({ reason: `All private RPCs failed for getLogs on chain ${chainId}` });
  throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
};

export const getBlockNumber = async (chainId: number): Promise<bigint> => {
  const chainData = CHAIN_ID_TO_CHAIN[chainId];

  const rpcList = [...chainData.publicRpcList, ...chainData.privateFreeRpcList, chainData.privatePaidRpc];

  if (!rpcList?.length) {
    handleError({ reason: `!rpcList?.length ${chainId}` });
    throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
  }

  for (const rpcUrl of rpcList) {
    try {
      const client = getOrCreateClient(rpcUrl, chainData.chain);
      return await client.getBlockNumber();
    } catch (error) {
      await handleError({ reason: `getBlockNumber: ${getRpcData(chainData, rpcUrl)}. Retrying..`, error });
    }
  }

  handleError({ reason: `All RPCs failed for getBlockNumber on chain ${chainId}` });
  throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
};

export const getRpcData = (chainData: IChain, rpc: string) => {
  if (chainData.publicRpcList.includes(rpc)) {
    return `Public RPC ${rpc}`;
  } else if (chainData.privateFreeRpcList.includes(rpc)) {
    const index = chainData.privateFreeRpcList.indexOf(rpc);
    return `Private Free RPC ${rpc} at index ${index}`;
  } else if (chainData.privatePaidRpc === rpc) {
    return `Private Paid RPC ${rpc}`;
  }
};
