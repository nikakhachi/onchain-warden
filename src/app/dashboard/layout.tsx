"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
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
      minH="100vh"
      display="flex"
      flexDirection="column"
      backgroundColor="gray.950"
    >
      <Navbar />
      <Box flex={1} display="flex">
        <DashboardSidebar />
        {children}
      </Box>
      <Footer />
    </Box>
  );
}
