"use client";

import { useState } from "react";
import {
  Input,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Box,
} from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Button } from "../Button";

interface AccountSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  walletAddress: string;
}

export function AccountSettingsDialog({ isOpen, onClose, username: initialUsername, walletAddress }: AccountSettingsDialogProps) {
  const { error: showError, success: showSuccess } = useToast();
  const { updateUsername } = useUser();
  const [username, setUsername] = useState(initialUsername);
  const [usernameError, setUsernameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateUsername = (name: string) => {
    if (!name.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    if (name.trim().length > 100) {
      setUsernameError("Username must be 100 characters or less");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateUsername(username)) {
      return;
    }

    if (username.trim() === initialUsername) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUsername({ username: username.trim() });
      showSuccess("Username updated successfully");
      setUsernameError("");
      onClose();
    } catch (error) {
      showError("Failed to update username");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setUsername(initialUsername);
    setUsernameError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white" maxW="500px">
        <ModalHeader position="relative" paddingBottom={4}>
          <HStack justifyContent="space-between" alignItems="flex-start" width="100%">
            <VStack alignItems="flex-start" gap={1} flex={1}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                Account Settings
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                Manage your account information
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <FormControl>
              <FormLabel color="gray.300">Wallet Address</FormLabel>
              <Box
                paddingX={4}
                paddingY={3}
                borderRadius="lg"
                backgroundColor="gray.950"
                borderWidth="1px"
                borderColor="gray.800"
                fontFamily="mono"
                fontSize="sm"
                color="gray.300"
              >
                {walletAddress}
              </Box>
              <Text fontSize="xs" color="gray.500" marginTop={1}>
                Your wallet address cannot be changed
              </Text>
            </FormControl>

            <FormControl isInvalid={!!usernameError}>
              <FormLabel color="gray.300">Username</FormLabel>
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameError("");
                }}
                placeholder="Enter username"
                borderColor={usernameError ? "red.500" : "gray.800"}
                backgroundColor="gray.950"
                color="white"
                _focus={{
                  borderColor: usernameError ? "red.500" : "blue.500",
                  boxShadow: usernameError
                    ? "0 0 0 1px var(--chakra-colors-red-500)"
                    : "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {usernameError && <FormErrorMessage>{usernameError}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={handleClose} marginRight={3}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}


