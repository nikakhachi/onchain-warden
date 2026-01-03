"use client";

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { generateSignatureData } from "../helpers";
import { generateUsername } from "unique-username-generator";
import { CURRENT_TEAM_STORAGE_KEY } from "./UserContext";
import { Doc } from "../../../convex/_generated/dataModel";

interface AccessToken {
  token: string;
  expiresAt: number;
}

interface AuthContextType {
  isConnected: boolean;
  currentAccount: string | undefined;
  isSigning: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  isAuthenticating: boolean;
  logout: () => void;
  accessToken: string | null;
  currentUser: Doc<"users"> | null | undefined;
  _getAccessToken: () => Promise<string>;
}

export const TOKEN_STORAGE_KEY = "onchain_warden_access_token";
export const TOKEN_EXPIRES_KEY = "onchain_warden_token_expires";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isConnected, address: currentAccount } = useAccount();
  const { signMessageAsync, isPending: isSigning } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const authenticate = useAction(api.auth_node.authenticate);

  const createUser = useAction(api.users.createUser);

  // Fetch current user
  const currentUser = useQuery(api.auth.getUserByAccessToken, accessToken ? { token: accessToken } : "skip") as
    | Doc<"users">
    | undefined
    | null;

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
      setAccessToken(result.accessToken);
    } catch (error) {
      setIsAuthenticating(false);
      throw error;
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
      setAccessToken(result.accessToken);
    } catch (error) {
      setIsAuthenticating(false);
      throw error;
    }
  }, [isConnected, currentAccount, signMessageAsync, createUser]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_KEY);
    localStorage.removeItem(CURRENT_TEAM_STORAGE_KEY);

    setAccessToken(null);

    disconnect();
  }, [disconnect]);

  useEffect(() => {
    (async () => {
      if (!currentAccount) {
        setAccessToken(null);
        setIsAuthenticating(false);
        return;
      }

      const storedToken = getStoredToken();

      setAccessToken(storedToken?.token || null);
    })();
  }, [currentAccount, getStoredToken]);

  useEffect(() => {
    if (currentUser) {
      setIsAuthenticating(false);
    }
  }, [currentUser]);

  const _getAccessToken = useCallback(async () => {
    if (!currentAccount || !currentUser) {
      throw new Error("Wallet not connected or not authenticated");
    }
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!token) {
      throw new Error("No access token found. Please sign in.");
    }

    return token;
  }, [currentAccount, currentUser]);

  return (
    <AuthContext.Provider
      value={{
        isConnected,
        currentAccount,
        isSigning,
        signIn,
        signUp,
        isAuthenticating,
        logout,
        accessToken,
        currentUser,
        _getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
