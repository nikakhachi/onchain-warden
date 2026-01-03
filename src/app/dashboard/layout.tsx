"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { DashboardSidebar } from "./components/DashboardSidebar";
import { useAuth } from "../providers/AuthContext";
import { DashboardNavbar } from "./components/DashboardNavbar";
import { UserProvider } from "../providers/UserContext";
import { ToastProvider } from "../providers/ToastContext";
import { AuthProvider } from "../providers/AuthContext";
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
  const { isConnected, currentUser, isAuthenticating } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardRoot = pathname === "/dashboard";
  const isSignIn = pathname === "/dashboard/signin";

  useEffect(() => {
    // problem here is isAuthneticating becoemns false first, and theres a delay for currentUser
    // this causes page to render to the signin, and then to my-alerrts
    if (!isAuthenticating) {
      if (currentUser && (isDashboardRoot || isSignIn)) {
        router.replace("/dashboard/my-alerts");
      } else if (!currentUser) {
        router.replace("/dashboard/signin");
      }
    }
  }, [isConnected, currentUser, pathname, isAuthenticating, router]);

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
          <AuthProvider>
            <UserProvider>
              <ToastProvider>
                <DashboardContent>{children}</DashboardContent>
              </ToastProvider>
            </UserProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
