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
} from "@chakra-ui/react";
import { useAuth } from "@/app/providers/AuthContext";
import { useToast } from "@/app/providers/ToastContext";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/Button";
import { signIn as nextAuthSignIn } from "next-auth/react";
import { Wallet } from "./Wallet";
import { Gmail } from "./Gmail";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpModal({ isOpen, onClose, onSwitchToSignIn }: SignUpModalProps) {
  const { isConnected, currentAccount, signUp, isAuthenticating } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const router = useRouter();
  const [shouldProcess, setShouldProcess] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) setShouldProcess(false);
  }, [isOpen]);

  // Trigger sign up when wallet connects after button click
  useEffect(() => {
    if (shouldProcess && isConnected && currentAccount && !isAuthenticating) {
      setShouldProcess(false);
      signUp()
        .then(() => {
          showSuccess("Account created successfully");
          onClose();
          router.push("/dashboard/my-alerts");
        })
        .catch((error: any) => {
          showError(error.data || "Failed to create account");
        });
    }
  }, [shouldProcess, isConnected, currentAccount, isAuthenticating, signUp, showSuccess, showError, onClose, router]);

  const handleWalletClick = async () => {
    if (isConnected && currentAccount) {
      // Wallet already connected, trigger sign up immediately
      try {
        await signUp();
        showSuccess("Account created successfully");
        onClose();
        router.push("/dashboard/my-alerts");
      } catch (error: any) {
        showError(error.data || "Failed to create account");
      }
    } else {
      // Wallet not connected, set flag to process after connection
      setShouldProcess(true);
    }
  };

  const handleGmailClick = async () => {
    try {
      await nextAuthSignIn("google", {
        callbackUrl: "/dashboard/my-alerts",
      } as any);
    } catch (error: any) {
      showError("Failed to sign up with Gmail");
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
                Create Account
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                Sign up to get started with Onchain Warden
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <Gmail handleClick={handleGmailClick} isAuthenticating={isAuthenticating} />
            <Wallet
              handleClick={handleWalletClick}
              isConnected={isConnected}
              currentAccount={currentAccount}
              isAuthenticating={isAuthenticating}
            />
          </VStack>
        </ModalBody>
        {onSwitchToSignIn && (
          <ModalFooter borderTopWidth="1px" borderTopColor="gray.800" paddingTop={4}>
            <HStack gap={2} width="100%" justifyContent="center">
              <Text color="gray.400" fontSize="sm">
                Have an account?
              </Text>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onSwitchToSignIn();
                }}
              >
                Sign in
              </Button>
            </HStack>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
}
