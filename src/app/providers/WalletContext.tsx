"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAccount } from "wagmi";

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();

  return (
    <WalletContext.Provider value={{ isConnected, address }}>
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
