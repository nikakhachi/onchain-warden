"use client";

import { useState, useEffect } from "react";
import { Box, VStack, HStack, Text, Heading, Spinner } from "@chakra-ui/react";
import { useWallet } from "../providers/WalletContext";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";
import { LoginModal } from "../components/AuthModals/LoginModal";
import { SignUpModal } from "../components/AuthModals/SignUpModal";
import { OnchainWatcherIcon } from "../icons/OnchainWatcherIcon";

export default function Dashboard() {
  const router = useRouter();
  const { hasValidToken, isAuthenticating } = useWallet();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    if (hasValidToken) router.replace("/dashboard/my-alerts");
  }, [hasValidToken, router]);

  return (
    <>
      {/* If the token is valid, user will be redirected. Spinner is before useEffect happens */}
      {isAuthenticating || hasValidToken ? (
        <HStack width="100%" height="100%" justifyContent="center" alignItems="center">
          <Spinner color="white" />
        </HStack>
      ) : (
        <>
          <Box
            flex={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            padding={8}
            minH="calc(100vh - 200px)"
          >
            <VStack gap={8} textAlign="center" maxW="500px">
              <VStack gap={4}>
                <OnchainWatcherIcon width="64px" height="64px" />
                <Heading as="h1" size="2xl" color="white" fontWeight="700">
                  Welcome to Onchain Warden
                </Heading>
                <Text color="gray.400" fontSize="md" lineHeight="1.6">
                  Log in to access your dashboard and start monitoring blockchain events.
                </Text>
              </VStack>

              <VStack gap={4} alignItems="flex-start" width="100%" paddingX={4}>
                <HStack gap={3} alignItems="flex-start">
                  <Box
                    width="24px"
                    height="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    marginTop={1}
                  >
                    <Text fontSize="lg">🔔</Text>
                  </Box>
                  <Text color="gray.300" fontSize="sm" textAlign="left">
                    Real-time blockchain alerts
                  </Text>
                </HStack>

                <HStack gap={3} alignItems="flex-start">
                  <Box
                    width="24px"
                    height="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    marginTop={1}
                  >
                    <Text fontSize="lg">🛡️</Text>
                  </Box>
                  <Text color="gray.300" fontSize="sm" textAlign="left">
                    Monitor any wallet or contract
                  </Text>
                </HStack>

                <HStack gap={3} alignItems="flex-start">
                  <Box
                    width="24px"
                    height="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                    marginTop={1}
                  >
                    <Text fontSize="lg">🔗</Text>
                  </Box>
                  <Text color="gray.300" fontSize="sm" textAlign="left">
                    Multi-chain support
                  </Text>
                </HStack>
              </VStack>

              <VStack gap={3} width="100%">
                <Button variant="primary" size="lg" onClick={() => setIsSignUpOpen(true)} width="100%">
                  Sign Up
                </Button>
                <Button variant="secondary" size="lg" onClick={() => setIsLoginOpen(true)} width="100%">
                  Log In
                </Button>
              </VStack>
            </VStack>
          </Box>
        </>
      )}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <SignUpModal isOpen={isSignUpOpen} onClose={() => setIsSignUpOpen(false)} />
    </>
  );
}
