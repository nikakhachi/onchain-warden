"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "../components/Navbar";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useWallet } from "../providers/WalletContext";

function AutoConnectModal({
  openConnectModal,
}: {
  openConnectModal: () => void;
}) {
  const { isConnected } = useWallet();
  const hasOpenedModalRef = useRef(false);

  useEffect(() => {
    if (!isConnected && !hasOpenedModalRef.current) {
      hasOpenedModalRef.current = true;
      // Small delay to ensure the modal can render properly
      setTimeout(() => {
        openConnectModal();
      }, 100);
    }
  }, [isConnected, openConnectModal]);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to /dashboard if user tries to access sub-pages without wallet connected
  useEffect(() => {
    if (!isConnected && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [isConnected, pathname, router]);

  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        const ready = mounted;

        return (
          <Box
            height="100vh"
            display="flex"
            flexDirection="column"
            overflow="hidden"
            backgroundColor="gray.950"
          >
            {ready && <AutoConnectModal openConnectModal={openConnectModal} />}
            <Navbar />
            <Box flex={1} display="flex" overflow="hidden">
              <DashboardSidebar />
              <Box flex={1} overflowY="auto">
                {isConnected ? (
                  children
                ) : (
                  <Box
                    flex={1}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    padding={8}
                  >
                    <VStack gap={4} textAlign="center" maxW="md">
                      <Heading as="h2" size="lg" color="white">
                        Connect Your Wallet
                      </Heading>
                      <Text color="gray.400" fontSize="md">
                        Please connect your wallet to access the dashboard and
                        manage your watchers.
                      </Text>
                    </VStack>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        );
      }}
    </ConnectButton.Custom>
  );
}
