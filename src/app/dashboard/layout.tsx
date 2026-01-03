"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { useWallet } from "../providers/WalletContext";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { UserProvider } from "../providers/UserContext";
import { ToastProvider } from "../providers/ToastContext";
import { WalletProvider } from "../providers/WalletContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";

const config = getDefaultConfig({
  appName: "Onchain Warden",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet],
});

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isConnected, currentUser, isAuthenticating } = useWallet();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoot = pathname === "/dashboard";

  useEffect(() => {
    if (!isConnected && pathname !== "/dashboard") {
      console.log("redirecting to dashboard 11");
      router.replace("/dashboard");
    } else if (isConnected && !currentUser && !isAuthenticating && pathname !== "/dashboard") {
      console.log("redirecting to dashboard 2");
      router.replace("/dashboard");
    }
  }, [isConnected, currentUser, pathname, router]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden" backgroundColor="gray.950">
      <DashboardNavbar />
      <Box flex={1} display="flex" overflow="hidden">
        {isConnected && currentUser && !isDashboardRoot && <DashboardSidebar />}
        <Box flex={1} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <WalletProvider>
            <UserProvider>
              <ToastProvider>
                <DashboardContent>{children}</DashboardContent>
              </ToastProvider>
            </UserProvider>
          </WalletProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
