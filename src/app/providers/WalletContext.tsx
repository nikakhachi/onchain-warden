"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateSignatureData } from "../helpers";
import { getAddress } from "viem";
import { generateUsername } from "unique-username-generator";
import { CURRENT_TEAM_STORAGE_KEY } from "./UserContext";

interface AccessToken {
  token: string;
  expiresAt: number;
}

interface WalletContextType {
  isConnected: boolean;
  currentAccount: string | undefined;
  isSigning: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  isAuthenticating: boolean;
  hasValidToken: boolean;
  logout: () => void;
}

export const TOKEN_STORAGE_KEY = "onchain_warden_access_token";
export const TOKEN_EXPIRES_KEY = "onchain_warden_token_expires";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { isConnected, address: currentAccount } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);

  const validateToken = useMutation(api.auth.validateToken);
  const authenticate = useAction(api.auth_node.authenticate);
  const createUser = useAction(api.users.createUser);

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

  const validateStoredToken = useCallback(
    async (token: string) => {
      if (currentAccount) {
        try {
          const user = await validateToken({ token });
          if (!user) return false;
          const userWallet = getAddress(user.wallet_address);
          return getAddress(userWallet) === getAddress(currentAccount);
        } catch (error) {
          return false;
        }
      }

      return false;
    },
    [validateToken, currentAccount],
  );

  const signIn = useCallback(async (): Promise<void> => {
    if (!isConnected || !currentAccount) throw new Error("Wallet not connected");

    setIsAuthenticating(true);

    try {
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
      setHasValidToken(true);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isConnected, currentAccount, signMessageAsync, authenticate]);

  const signUp = useCallback(async (): Promise<void> => {
    if (!isConnected || !currentAccount) throw new Error("Wallet not connected");

    setIsAuthenticating(true);

    try {
      const { message, expiresAt, nonce } = generateSignatureData();
      const signature = await signMessageAsync({ message });

      const result = await createUser({
        wallet_address: currentAccount,
        username: generateUsername("-", 3),
        signature,
        expiresAt,
        nonce,
      });

      localStorage.setItem(TOKEN_STORAGE_KEY, result.accessToken);
      localStorage.setItem(TOKEN_EXPIRES_KEY, result.expiresAt.toString());
      setHasValidToken(true);
    } catch (error) {
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isConnected, currentAccount, signMessageAsync, createUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(CURRENT_TEAM_STORAGE_KEY);

    setHasValidToken(false);

    disconnect();
  }, [disconnect]);

  useEffect(() => {
    (async () => {
      if (!currentAccount) {
        setHasValidToken(false);
        setIsAuthenticating(false);
        return;
      }

      const storedToken = getStoredToken();
      if (storedToken) {
        const isValid = await validateStoredToken(storedToken.token);
        setHasValidToken(isValid);
      } else {
        setHasValidToken(false);
      }

      setIsAuthenticating(false);
    })();
  }, [currentAccount, getStoredToken, validateStoredToken]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        currentAccount,
        isSigning,
        signIn,
        signUp,
        isAuthenticating,
        hasValidToken,
        logout,
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
