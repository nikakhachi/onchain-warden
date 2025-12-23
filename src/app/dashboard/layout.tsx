"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "../components/Navbar";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useWallet } from "../providers/WalletContext";
import { Button } from "../components/Button";

const AutoConnectModal = ({
  openConnectModal,
}: {
  openConnectModal: () => void;
}) => {
  const { isConnected } = useWallet();

  useEffect(() => {
    // Only open connect modal if wallet is not connected
    // Authentication is handled by WalletContext
    if (!isConnected) openConnectModal();
  }, [isConnected, openConnectModal]);

  return null;
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, getStoredToken } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  const storedToken = getStoredToken();

  useEffect(() => {
    if ((!isConnected || !storedToken) && pathname !== "/dashboard")
      router.replace("/dashboard");
  }, [isConnected, storedToken, pathname, router]);

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
                {isConnected && storedToken ? (
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
                        {isConnected
                          ? "Authentication Required"
                          : "Connect Your Wallet"}
                      </Heading>
                      <Text color="gray.400" fontSize="md">
                        {isConnected
                          ? "Please sign the message to authenticate and access the dashboard."
                          : "Please connect your wallet to access the dashboard and manage your alerts."}
                      </Text>
                      {isConnected ? (
                        <Text color="gray.500" fontSize="sm">
                          The authentication modal should open automatically. If
                          it doesn't, please refresh the page.
                        </Text>
                      ) : (
                        <Button
                          variant="primary"
                          size="md"
                          onClick={openConnectModal}
                        >
                          Connect Wallet
                        </Button>
                      )}
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
