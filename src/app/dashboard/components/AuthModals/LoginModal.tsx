"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { useAuth } from "@/app/providers/AuthContext";
import { useToast } from "@/app/providers/ToastContext";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/Button";
import { signIn as nextAuthSignIn } from "next-auth/react";
// import { Wallet } from "./Wallet";
import { Gmail } from "./Gmail";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) {
  const { isConnected, currentAccount, authenticateWithWallet, isAuthenticating } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();
  const [shouldProcess, setShouldProcess] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) setShouldProcess(false);
  }, [isOpen]);

  // Trigger sign in when wallet connects after button click
  useEffect(() => {
    if (shouldProcess && isConnected && currentAccount && !isAuthenticating) {
      setShouldProcess(false);
      authenticateWithWallet()
        .then(() => {
          showSuccess("Signed in successfully");
          onClose();
          router.push("/dashboard/alerts");
        })
        .catch((error: any) => {
          showError(error.data || "Failed to sign in");
        });
    }
  }, [
    shouldProcess,
    isConnected,
    currentAccount,
    isAuthenticating,
    authenticateWithWallet,
    showSuccess,
    showError,
    onClose,
    router,
  ]);

  const handleWalletClick = async () => {
    if (isConnected && currentAccount) {
      // Wallet already connected, trigger sign in immediately
      try {
        await authenticateWithWallet();
        showSuccess("Signed in successfully");
        onClose();
        router.push("/dashboard/alerts");
      } catch (error: any) {
        showError(error.data || "Failed to sign in");
      }
    } else {
      // Wallet not connected, set flag to process after connection
      setShouldProcess(true);
    }
  };

  const handleGmailClick = async () => {
    try {
      await nextAuthSignIn("google", {
        callbackUrl: "/dashboard/alerts",
      } as any);
    } catch (error: any) {
      showError("Failed to sign in with Gmail");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white" maxW="500px">
        <ModalHeader position="relative" paddingBottom={4}>
          <HStack justifyContent="space-between" alignItems="flex-start" width="100%">
            <VStack alignItems="flex-start" gap={1} flex={1}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                Sign in
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                Authenticate to access your dashboard
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <Gmail handleClick={handleGmailClick} isAuthenticating={isAuthenticating} />
            {/* <Wallet
              handleClick={handleWalletClick}
              isConnected={isConnected}
              currentAccount={currentAccount}
              isAuthenticating={isAuthenticating}
            /> */}
            <Text color="gray.400" fontSize="xs" textAlign="center" marginTop={2}>
              By continuing, you agree to our{" "}
              <Link
                href="/terms-of-service"
                target="_blank"
                color="blue.400"
                _hover={{ color: "blue.300", textDecoration: "underline" }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                target="_blank"
                color="blue.400"
                _hover={{ color: "blue.300", textDecoration: "underline" }}
              >
                Privacy Policy
              </Link>
            </Text>
          </VStack>
        </ModalBody>
        {onSwitchToSignUp && (
          <ModalFooter borderTopWidth="1px" borderTopColor="gray.800" paddingTop={4}>
            <HStack gap={2} width="100%" justifyContent="center">
              <Text color="gray.400" fontSize="sm">
                Don't have an account?
              </Text>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onSwitchToSignUp();
                }}
              >
                Sign up
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
