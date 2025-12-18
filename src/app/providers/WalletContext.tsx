"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  signMessage: (message: string) => Promise<string>;
  isSigning: boolean;
  userTasks: any[] | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  const userTasks = useQuery(
    api.user.getUsersTasks,
    address ? { wallet_address: address } : "skip"
  );

  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    return await signMessageAsync({ message });
  };

  return (
    <WalletContext.Provider
      value={{ isConnected, address, signMessage, isSigning, userTasks }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
