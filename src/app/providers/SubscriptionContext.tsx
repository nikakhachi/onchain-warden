"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { Plan, plans } from "../shared/plans";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  handleCheckout: (priceId: string | undefined) => Promise<void>;
  plans: Plan[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    (async () => {
      const paddle = await initializePaddle({
        environment: "sandbox",
        token: "test_da51d9fe49e9bed6b06769e5ed6",
      });
      setPaddle(paddle);
    })();
  }, []);

  const handleCheckout = async (priceId: string | undefined) => {
    if (paddle && currentUser && priceId) {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: {
          displayMode: "overlay",
          theme: "dark",
          successUrl: `${window.location.origin}/dashboard`,
        },
        customData: {
          email: currentUser.email,
          walletAddress: currentUser.wallet_address,
        },
      });
    }
  };

  return <SubscriptionContext.Provider value={{ handleCheckout, plans }}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
