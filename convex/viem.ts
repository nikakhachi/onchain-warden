import { AbiEvent, Address, createPublicClient, http, Log, parseAbiItem, PublicClient } from "viem";
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
