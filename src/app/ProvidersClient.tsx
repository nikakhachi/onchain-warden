"use client";

import { ReactNode, useState } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ChakraProvider } from "@chakra-ui/react";
import { customSystem } from "./theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import { WalletProvider } from "./providers/WalletContext";
import { UserProvider } from "./providers/UserContext";
import { ToastProvider } from "./providers/ToastContext";
import "@rainbow-me/rainbowkit/styles.css";

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
    <ChakraProvider theme={customSystem}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <ConvexProvider client={convex}>
              <WalletProvider>
                <UserProvider>
                  <ToastProvider>{children}</ToastProvider>
                </UserProvider>
              </WalletProvider>
            </ConvexProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ChakraProvider>
  );
}
