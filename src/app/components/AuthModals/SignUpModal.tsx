"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWallet } from "../../providers/WalletContext";
import { useToast } from "../../providers/ToastContext";
import { useRouter } from "next/navigation";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
  const { isConnected, currentAccount, signUp, isAuthenticating } = useWallet();
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
          showError(error.message || "Failed to create account");
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
        showError(error.message || "Failed to create account");
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
                    borderColor={"gray.700"}
                    backgroundColor={"gray.800"}
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
                        MetaMask, Rainbow, Coinbase & more
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
      </ModalContent>
    </Modal>
  );
}
