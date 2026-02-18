import { AbiEvent, Address, Chain, createPublicClient, http, Log, parseAbi, parseAbiItem, PublicClient } from "viem";
import { handleError } from "./errors/handleError";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { ConvexError } from "convex/values";
import { CHAINS_LIST } from "./data/chains";
import { katana } from "viem/chains";

interface IChain {
  name: string;
  blockExplorer: string;
  chain: Chain;
  publicRpcList: string[];
  privateFreeRpcList: string[];
  privatePaidRpc_drpc: string;
  privatePaidRpc_alchemy: string;
}

// RPC config: chain name -> { drpc slug, publicnode slug }
const RPC_CONFIG: Record<string, { drpc: string; publicnode: string; alchemy?: string }> = {
  Ethereum: { drpc: "ethereum", publicnode: "ethereum", alchemy: "eth-mainnet" },
  Base: { drpc: "base", publicnode: "base", alchemy: "base-mainnet" },
  "BNB Smart Chain": { drpc: "bsc", publicnode: "bsc", alchemy: "bnb-mainnet" },
  Avalanche: { drpc: "avalanche", publicnode: "avalanche-c-chain", alchemy: "avax-mainnet" },
  "Arbitrum One": { drpc: "arbitrum", publicnode: "arbitrum", alchemy: "arb-mainnet" },
  Katana: { drpc: "katana", publicnode: "katana-does-not-exist-hah" },
};

export const CHAIN_ID_TO_CHAIN: Record<number, IChain> = CHAINS_LIST.reduce((acc: Record<number, IChain>, chain) => {
  const config = RPC_CONFIG[chain.name];
  const drpcPublic = config ? `https://${config.drpc}.drpc.org` : "";
  const publicnode = config ? `https://${config.publicnode}-rpc.publicnode.com` : "";

  acc[chain.id] = {
    name: chain.name,
    blockExplorer: chain.blockExplorers?.default.url,
    chain: chain,
    publicRpcList: config ? [drpcPublic, publicnode] : [],
    privateFreeRpcList: config
      ? [
          `https://lb.drpc.live/${config.drpc}/${process.env.DRPC_FREE_RPC_KEY_1}`,
          `https://lb.drpc.live/${config.drpc}/${process.env.DRPC_FREE_RPC_KEY_2}`,
        ]
      : [],
    privatePaidRpc_drpc: config ? `https://lb.drpc.live/${config.drpc}/${process.env.DRPC_PAID_RPC_KEY}` : "",
    privatePaidRpc_alchemy: config
      ? `https://${config.alchemy}.g.alchemy.com/v2/${process.env.ALCHEMY_PAID_RPC_KEY}`
      : "",
  };
  return acc;
}, {});

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
    ? [
        ...chainData.publicRpcList,
        ...rotatedPrivateFreeRpcs,
        chainData.privatePaidRpc_drpc,
        chainData.privatePaidRpc_alchemy,
      ]
    : [...rotatedPrivateFreeRpcs, chainData.privatePaidRpc_drpc, chainData.privatePaidRpc_alchemy];

  for (let i = 0; i < rpcList.length; i++) {
    const rpcUrl = rpcList[i];
    try {
      const client = getOrCreateClient(rpcUrl, chainData.chain);

      const obj = { address: contractAddress, fromBlock, toBlock };

      if (events.length === 1) {
        return await client.getLogs({ ...obj, event: parseAbiItem(events[0]) as AbiEvent, args });
      } else {
        return await client.getLogs({ ...obj, events: parseAbi(events) });
      }
    } catch (error) {
      if (i === rpcList.length - 2) {
        await handleError({ reason: `Paid dRPC failed | getLogs`, error });
      } else if (i === rpcList.length - 1) {
        await handleError({ reason: `Paid Alchemy failed | getLogs`, error });
      }
    }
  }

  await handleError({ reason: `🚨 All RPCs failed for getLogs on chain ${chainId}` });
  throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
};

export const getBlockNumber = async (chainId: number): Promise<bigint> => {
  const chainData = CHAIN_ID_TO_CHAIN[chainId];

  const rpcList = [
    ...chainData.publicRpcList,
    ...chainData.privateFreeRpcList,
    chainData.privatePaidRpc_drpc,
    chainData.privatePaidRpc_alchemy,
  ];

  if (!rpcList?.length) {
    handleError({ reason: `!rpcList?.length ${chainId}` });
    throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
  }

  for (let i = 0; i < rpcList.length; i++) {
    const rpcUrl = rpcList[i];
    try {
      const client = getOrCreateClient(rpcUrl, chainData.chain);
      let blockNumber = await client.getBlockNumber();

      if (chainId === katana.id) blockNumber = BigInt(Number(blockNumber) - 2);

      return blockNumber;
    } catch (error) {
      if (i === rpcList.length - 2) {
        await handleError({ reason: `Paid dRPC failed | getBlockNumber`, error });
      } else if (i === rpcList.length - 1) {
        await handleError({ reason: `Paid Alchemy failed | getBlockNumber`, error });
      }
    }
  }

  await handleError({ reason: `🚨 All RPCs failed for getBlockNumber on chain ${chainId}` });
  throw new ConvexError(ERROR_MESSAGES.RPC_CALL_FAILED);
};
