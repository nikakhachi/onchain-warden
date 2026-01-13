"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { useAuth } from "./AuthContext";

interface SubscriptionContextType {
  handleCheckout: (priceId: string | undefined) => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();

  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    (async () => {
      const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!;

      if (clientToken) {
        const paddle = await initializePaddle({
          environment: clientToken.includes("test") ? "sandbox" : "production",
          token: clientToken,
        });
        setPaddle(paddle);
      }
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
        customer: {
          email: currentUser.email || "",
        },
        customData: {
          email: currentUser.email,
          walletAddress: currentUser.wallet_address,
        },
      });
    }
  };

  return <SubscriptionContext.Provider value={{ handleCheckout }}>{children}</SubscriptionContext.Provider>;
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
