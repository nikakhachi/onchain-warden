"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";

interface Plan {
  title: "Free" | "Solo" | "Team";
  description: string;
  monthlyPrice: number;
  monthlyPriceId?: string;
  annualPrice: number;
  annualPriceId?: string;
  extraAlerts?: string;
  alerts: number;
  features: string[];
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

const plans: Plan[] = [
  {
    title: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    alerts: 5,
    features: [
      "Real-time Alerts",
      "Delivered to Telegram, Slack & Discord",
      "Ethereum & Base Support",
      "Unlimited Channels",
      "Community Support on Discord",
    ],
    buttonText: "Get Started",
    buttonVariant: "secondary",
  },
  {
    title: "Solo",
    description: "For power users",
    monthlyPrice: 29,
    monthlyPriceId: "pri_01kekgmh0cfsstms0d1f8r7e1z",
    annualPrice: 290,
    annualPriceId: "pri_01kekgn4vdngnng4bj2yvkcdpz",
    alerts: 30,
    extraAlerts: "+$5 for every extra 10 alerts",
    features: ["Real-time Alerts", "Everything in Free", "On-Demand EVM Chain Integrations", "Priority Support"],
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
  {
    title: "Team",
    description: "For teams & organizations",
    monthlyPrice: 89,
    monthlyPriceId: "pri_01kekgnygt02mthjrh2n4wam3e",
    annualPrice: 890,
    annualPriceId: "pri_01kekgpf16s7had6vkkxtgkety",
    alerts: 100,
    extraAlerts: "+$10 for every extra 25 alerts",
    features: ["Real-time Alerts", "Unlimited Members", "On-Demand EVM Chain Integrations", "Hands-on Support"],
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
];

interface SubscriptionContextType {
  handleCheckout: (priceId: string | undefined) => Promise<void>;
  plans: Plan[];
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
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
    if (paddle && priceId) {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        settings: { displayMode: "overlay", theme: "dark" },
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
