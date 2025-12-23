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
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateSignatureData } from "../helpers";

interface AccessToken {
  token: string;
  expiresAt: number;
}

interface WalletContextType {
  isConnected: boolean;
  address: string | undefined;
  signMessage: (message: string) => Promise<string>;
  isSigning: boolean;
  userEventWatchers: any[] | undefined;
  getAccessToken: () => Promise<string | null>;
  isAuthenticating: boolean;
  hasValidToken: () => boolean;
}

const TOKEN_STORAGE_KEY = "onchain_warden_access_token";
const TOKEN_EXPIRES_KEY = "onchain_warden_token_expires";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const authenticate = useAction(api.auth_node.authenticate);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const pathname = usePathname();
  const isDashboardPage = pathname?.startsWith("/dashboard") ?? false;

  const userEventWatchers = useQuery(
    api.user.getUsersEventWatchers,
    address ? { wallet_address: address } : "skip"
  );

  const signMessage = async (message: string): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }
    return await signMessageAsync({ message });
  };

  // Get stored token from localStorage
  const getStoredToken = useCallback((): AccessToken | null => {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiresAtStr = localStorage.getItem(TOKEN_EXPIRES_KEY);

    if (!token || !expiresAtStr) return null;

    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      // Token expired, clean up
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(TOKEN_EXPIRES_KEY);
      return null;
    }

    return { token, expiresAt };
  }, []);

  // Store token in localStorage
  const storeToken = useCallback((token: string, expiresAt: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString());
  }, []);

  // Authenticate and get access token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!isConnected || !address) {
      return null;
    }

    // Check if we have a valid stored token
    const storedToken = getStoredToken();
    if (storedToken && storedToken.expiresAt > Date.now() + 1000 * 60) {
      return storedToken.token;
    }

    // Need to authenticate
    setIsAuthenticating(true);
    try {
      const { message, expiresAt, nonce } = generateSignatureData();
      const signature = await signMessageAsync({ message });

      const result = await authenticate({
        owner: address,
        signature,
        expiresAt,
        nonce,
      });

      storeToken(result.accessToken, result.expiresAt);
      return result.accessToken;
    } catch (error) {
      console.error("Authentication failed:", error);
      return null;
    } finally {
      setIsAuthenticating(false);
    }
  }, [
    isConnected,
    address,
    signMessageAsync,
    authenticate,
    getStoredToken,
    storeToken,
  ]);

  // Check if token is valid
  const hasValidToken = useCallback((): boolean => {
    const storedToken = getStoredToken();
    return storedToken !== null && storedToken.expiresAt > Date.now();
  }, [getStoredToken]);

  // Auto-authenticate when wallet connects, but ONLY on dashboard pages
  useEffect(() => {
    if (isConnected && address && isDashboardPage) {
      const storedToken = getStoredToken();
      // Only auto-authenticate if we don't have a valid token
      if (!storedToken || storedToken.expiresAt <= Date.now()) {
        getAccessToken();
      }
    } else {
      // Clear token when wallet disconnects
      if (!isConnected && typeof window !== "undefined") {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(TOKEN_EXPIRES_KEY);
      }
    }
  }, [isConnected, address, isDashboardPage, getAccessToken, getStoredToken]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        signMessage,
        isSigning,
        userEventWatchers,
        getAccessToken,
        isAuthenticating,
        hasValidToken,
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
