"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Navbar } from "../components/Navbar";
import { DashboardSidebar } from "../components/DashboardSidebar";
import { useWallet } from "../providers/WalletContext";
import { Button } from "../components/Button";

function AutoConnectModal({
  openConnectModal,
}: {
  openConnectModal: () => void;
}) {
  const { isConnected, hasValidToken, getAccessToken } = useWallet();
  const hasAttemptedAuthRef = useRef(false);
  const hasOpenedConnectModalRef = useRef(false);

  useEffect(() => {
    if (isConnected && !hasValidToken() && !hasAttemptedAuthRef.current) {
      // Wallet is connected but token is invalid - trigger signing
      hasAttemptedAuthRef.current = true;
      // Try to get access token (which will trigger signing modal)
      getAccessToken();
    } else if (!isConnected && !hasOpenedConnectModalRef.current) {
      // Wallet is not connected - open connect modal
      hasOpenedConnectModalRef.current = true;
      setTimeout(() => {
        openConnectModal();
      }, 100);
    }

    // Reset refs when wallet disconnects
    if (!isConnected) {
      hasAttemptedAuthRef.current = false;
      hasOpenedConnectModalRef.current = false;
    }
  }, [isConnected, hasValidToken, getAccessToken, openConnectModal]);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected, hasValidToken } = useWallet();
  const router = useRouter();
  const pathname = usePathname();

  // Check if user has valid token
  const hasValidAccessToken = hasValidToken();

  // Redirect to /dashboard if user tries to access sub-pages without wallet connected or valid token
  useEffect(() => {
    if ((!isConnected || !hasValidAccessToken) && pathname !== "/dashboard") {
      router.replace("/dashboard");
    }
  }, [isConnected, hasValidAccessToken, pathname, router]);

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
                {isConnected && hasValidAccessToken ? (
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
