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
  Box,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAuth } from "@/app/providers/AuthContext";
import { useToast } from "@/app/providers/ToastContext";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/Button";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp?: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignUp }: LoginModalProps) {
  const { isConnected, currentAccount, signIn, isAuthenticating } = useAuth();
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
      signIn()
        .then(() => {
          showSuccess("Signed in successfully");
          onClose();
          router.push("/dashboard/my-alerts");
        })
        .catch((error: any) => {
          showError(error.data || "Failed to sign in");
        });
    }
  }, [shouldProcess, isConnected, currentAccount, isAuthenticating, signIn, showSuccess, showError, onClose, router]);

  const handleWalletClick = async () => {
    if (isConnected && currentAccount) {
      // Wallet already connected, trigger sign in immediately
      try {
        await signIn();
        showSuccess("Signed in successfully");
        onClose();
        router.push("/dashboard/my-alerts");
      } catch (error: any) {
        showError(error.data || "Failed to sign in");
      }
    } else {
      // Wallet not connected, set flag to process after connection
      setShouldProcess(true);
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
                Connect your wallet to access your dashboard
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <ConnectButton.Custom>
              {({ openConnectModal, mounted }) => {
                const ready = mounted;
                const handleClick = () => {
                  if (isConnected && currentAccount) {
                    handleWalletClick();
                  } else {
                    handleWalletClick();
                    if (ready) openConnectModal();
                  }
                };

                return (
                  <Box
                    as="button"
                    onClick={handleClick}
                    disabled={!ready || isAuthenticating}
                    display="flex"
                    alignItems="center"
                    gap={4}
                    padding={4}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor="gray.700"
                    backgroundColor="gray.800"
                    color="white"
                    transition="all 0.2s"
                    _hover={!isAuthenticating ? { borderColor: "gray.600", backgroundColor: "gray.700" } : {}}
                    width="100%"
                    cursor={isAuthenticating ? "not-allowed" : "pointer"}
                  >
                    <Box
                      width="48px"
                      height="48px"
                      borderRadius="lg"
                      backgroundColor="orange.500"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize="xl">👛</Text>
                    </Box>
                    <VStack alignItems="flex-start" gap={0} flex={1}>
                      <Text fontWeight="600" fontSize="md">
                        EVM Extension Wallet
                      </Text>
                      <Text fontSize="sm" color="gray.300">
                        MetaMask, Phantom, Coinbase & more
                      </Text>
                    </VStack>
                  </Box>
                );
              }}
            </ConnectButton.Custom>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              More options coming soon
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
