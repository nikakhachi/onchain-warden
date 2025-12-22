"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useWallet } from "../providers/WalletContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (!isConnected) router.push("/");
  }, [isConnected, router]);

  if (isConnected === false) return null;

  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      backgroundColor="gray.950"
    >
      <Navbar />
      <Box flex={1} display="flex" overflow="hidden">
        <DashboardSidebar />
        <Box flex={1} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
