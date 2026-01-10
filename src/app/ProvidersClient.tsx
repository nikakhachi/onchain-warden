"use client";

import { ReactNode, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { customSystem } from "./theme";
import { ToastProvider } from "./providers/ToastContext";
import { SubscriptionProvider } from "./providers/SubscriptionContext";
import { AuthProvider } from "./providers/AuthContext";
import { WagmiProvider } from "wagmi";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { mainnet } from "viem/chains";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const config = getDefaultConfig({
  appName: "Onchain Warden",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet],
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <ChakraProvider theme={customSystem}>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <ToastProvider>
                <ConvexProvider client={convex}>
                  <AuthProvider>
                    <SubscriptionProvider>{children}</SubscriptionProvider>
                  </AuthProvider>
                </ConvexProvider>
              </ToastProvider>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ChakraProvider>
    </SessionProvider>
  );
}
