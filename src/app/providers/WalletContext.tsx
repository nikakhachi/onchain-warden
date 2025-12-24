"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { useAccount, useSignMessage } from "wagmi";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateSignatureData } from "../helpers";

interface AccessToken {
  token: string;
  expiresAt: number;
}

interface WalletContextType {
  isConnected: boolean;
  currentAccount: string | undefined;
  isSigning: boolean;
  getAccessTokenOrAuthenticate: () => Promise<string | null>;
  isAuthenticating: boolean;
  getStoredToken: () => AccessToken | null;
}

const TOKEN_STORAGE_KEY = "onchain_warden_access_token";
const TOKEN_EXPIRES_KEY = "onchain_warden_token_expires";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith("/dashboard") ?? false;

  const { isConnected, address: currentAccount } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = useAction(api.auth_node.authenticate);

  // Get stored token from localStorage, or remove it if it's (becoming) invalid
  const getStoredToken = useCallback((): AccessToken | null => {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiresAtStr = localStorage.getItem(TOKEN_EXPIRES_KEY);

    if (!token || !expiresAtStr) return null;

    const expiresAt = parseInt(expiresAtStr, 10);

    // If the access token expires in less than 5 minutes, remove it
    const deadline = Date.now() + 1000 * 60 * 5;

    if (isNaN(expiresAt) || expiresAt < deadline) {
      // Token expired, clean up
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRES_KEY);
      return null;
    }

    return { token, expiresAt };
  }, []);

  // Get access token if stored, or authenticate the user
  const getAccessTokenOrAuthenticate = useCallback(async (): Promise<
    string | null
  > => {
    if (!isConnected || !currentAccount) return null;

    const storedToken = getStoredToken();
    if (storedToken) return storedToken.token;

    setIsAuthenticating(true);

    const { message, expiresAt, nonce } = generateSignatureData();
    const signature = await signMessageAsync({ message });

    const result = await authenticate({
      owner: currentAccount,
      signature,
      expiresAt,
      nonce,
    });

    localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken);
    localStorage.setItem(TOKEN_EXPIRES_KEY, result.expiresAt.toString());

    setIsAuthenticating(false);

    return result.accessToken;
  }, [
    isConnected,
    currentAccount,
    signMessageAsync,
    authenticate,
    getStoredToken,
  ]);

  // Fetch access token or authenticate when wallet connects and is on dashboard page
  useEffect(() => {
    if (isConnected && currentAccount && isDashboardPage) {
      const storedToken = getStoredToken();

      if (!storedToken) getAccessTokenOrAuthenticate();
    }
  }, [
    isConnected,
    currentAccount,
    isDashboardPage,
    getAccessTokenOrAuthenticate,
    getStoredToken,
  ]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        currentAccount,
        isSigning,
        getAccessTokenOrAuthenticate,
        isAuthenticating,
        getStoredToken,
      }}
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
