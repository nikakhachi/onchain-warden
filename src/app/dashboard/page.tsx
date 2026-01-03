"use client";

import { useState, useEffect } from "react";
import { Box, VStack, Text, Heading } from "@chakra-ui/react";
import { useAuth } from "../providers/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "../components/Button";
import { LoginModal } from "./components/AuthModals/LoginModal";
import { SignUpModal } from "./components/AuthModals/SignUpModal";
import { OnchainWatcherIcon } from "../icons/OnchainWatcherIcon";
import { LoadingScreen } from "./components/LoadingScreen";

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, isAuthenticating } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    if (currentUser) router.replace("/dashboard/my-alerts");
  }, [currentUser, router]);

  return (
    <>
      {/* If the token is valid, user will be redirected. Spinner is before useEffect happens */}
      {isAuthenticating || currentUser ? (
        <LoadingScreen />
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
                  Sign in to access your dashboard and start monitoring blockchain events.
                </Text>
              </VStack>
              <VStack gap={3} width="100%">
                <Button variant="secondary" size="lg" onClick={() => setIsLoginOpen(true)} width="100%">
                  Sign In
                </Button>
                <Button variant="primary" size="lg" onClick={() => setIsSignUpOpen(true)} width="100%">
                  Sign Up
                </Button>
              </VStack>
            </VStack>
          </Box>
        </>
      )}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignUp={() => setIsSignUpOpen(true)}
      />
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToSignIn={() => setIsLoginOpen(true)}
      />
    </>
  );
}
