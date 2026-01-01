"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useWallet } from "../providers/WalletContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, hasValidToken } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isConnected && pathname !== "/dashboard") {
      router.replace("/dashboard");
    } else if (isConnected && !hasValidToken && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [isConnected, hasValidToken, pathname, router]);

  return (
    <Box height="100vh" display="flex" flexDirection="column" overflow="hidden" backgroundColor="gray.950">
      <Navbar />
      <Box flex={1} display="flex" overflow="hidden">
        {isConnected && hasValidToken && <DashboardSidebar />}
        <Box flex={1} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
