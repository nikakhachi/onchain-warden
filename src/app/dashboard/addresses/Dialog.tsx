"use client";

import { useState } from "react";
import { isAddress } from "viem";
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
} from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Button } from "../../components/Button";

interface AddAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAddressDialog({ isOpen, onClose }: AddAddressDialogProps) {
  const { error: showError, success: showSuccess } = useToast();
  const { createOwnerAddress } = useUser();
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [labelError, setLabelError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateLabel = (label: string) => {
    if (!label.trim()) {
      setLabelError("Label is required");
      return false;
    }
    setLabelError("");
    return true;
  };

  const validateAddress = (addr: string) => {
    if (!addr.trim()) {
      setAddressError("Address is required");
      return false;
    }
    if (!isAddress(addr.trim())) {
      setAddressError("Invalid EVM address format");
      return false;
    }
    setAddressError("");
    return true;
  };

  const handleSubmit = async () => {
    const isLabelValid = validateLabel(newLabel);
    const isAddressValid = validateAddress(newAddress);

    if (!isLabelValid || !isAddressValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createOwnerAddress({
        label: newLabel.trim(),
        address: newAddress.trim(),
      });

      showSuccess("Address added successfully");
      setNewLabel("");
      setNewAddress("");
      setLabelError("");
      setAddressError("");
      onClose();
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to create address"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewLabel("");
    setNewAddress("");
    setLabelError("");
    setAddressError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay
        backgroundColor="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
      />
      <ModalContent
        backgroundColor="gray.900"
        borderColor="gray.800"
        borderWidth="1px"
        color="white"
        maxW="500px"
      >
        <ModalHeader position="relative" paddingBottom={4}>
          <HStack
            justifyContent="space-between"
            alignItems="flex-start"
            width="100%"
          >
            <VStack alignItems="flex-start" gap={1} flex={1}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                Add Address
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                Save an address with a custom label for easy reference
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <FormControl isInvalid={!!labelError}>
              <FormLabel color="gray.300">Label</FormLabel>
              <Input
                value={newLabel}
                onChange={(e) => {
                  setNewLabel(e.target.value);
                  setLabelError("");
                }}
                placeholder="e.g., My Wallet"
                borderColor={labelError ? "red.500" : "gray.800"}
                backgroundColor="gray.950"
                color="white"
                _focus={{
                  borderColor: labelError ? "red.500" : "blue.500",
                  boxShadow: labelError
                    ? "0 0 0 1px var(--chakra-colors-red-500)"
                    : "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {labelError && <FormErrorMessage>{labelError}</FormErrorMessage>}
            </FormControl>

            <FormControl isInvalid={!!addressError}>
              <FormLabel color="gray.300">Address</FormLabel>
              <Input
                value={newAddress}
                onChange={(e) => {
                  setNewAddress(e.target.value);
                  validateAddress(e.target.value);
                }}
                placeholder="0x..."
                borderColor={addressError ? "red.500" : "gray.800"}
                backgroundColor="gray.950"
                color="white"
                fontFamily="mono"
                _focus={{
                  borderColor: addressError ? "red.500" : "blue.500",
                  boxShadow: addressError
                    ? "0 0 0 1px var(--chakra-colors-red-500)"
                    : "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {addressError && (
                <FormErrorMessage>{addressError}</FormErrorMessage>
              )}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            marginRight={3}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Add Address
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
