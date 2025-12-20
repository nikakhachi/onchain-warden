"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { isAddress } from "viem";
import {
  Input,
  VStack,
  HStack,
  Text,
  FieldRoot,
  FieldLabel,
  FieldErrorText,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { CREATE_OWNER_ADDRESS_SIGN_MESSAGE } from "../../constants";
import { Button } from "../../components/Button";

interface AddAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAddressDialog({ isOpen, onClose }: AddAddressDialogProps) {
  const { address, signMessage, isSigning } = useWallet();
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [labelError, setLabelError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOwnerAddress = useAction(
    api.ownerAddresses.createOwnerAddressAction
  );

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
    if (!address) {
      alert("Error: Wallet not connected.");
      return;
    }

    const isLabelValid = validateLabel(newLabel);
    const isAddressValid = validateAddress(newAddress);

    if (!isLabelValid || !isAddressValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      let signature: string;
      try {
        signature = await signMessage(CREATE_OWNER_ADDRESS_SIGN_MESSAGE);
      } catch (error) {
        alert(
          `Error: ${
            error instanceof Error
              ? error.message
              : "Failed to sign message. Please try again."
          }`
        );
        setIsSubmitting(false);
        return;
      }

      await createOwnerAddress({
        label: newLabel.trim(),
        address: newAddress.trim(),
        owner: address,
        signature,
      });

      setNewLabel("");
      setNewAddress("");
      setLabelError("");
      setAddressError("");
      onClose();
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to create address"
        }`
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
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogBackdrop
        backgroundColor="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
      />
      <DialogPositioner>
        <DialogContent
          backgroundColor="gray.900"
          borderColor="gray.800"
          borderWidth="1px"
          color="white"
          maxW="500px"
        >
          <DialogHeader position="relative" paddingBottom={4}>
            <HStack
              justifyContent="space-between"
              alignItems="flex-start"
              width="100%"
            >
              <VStack alignItems="flex-start" gap={1} flex={1}>
                <DialogTitle fontSize="xl" fontWeight="bold" color="white">
                  Add Address
                </DialogTitle>
                <Text color="gray.400" fontSize="sm" marginTop={0}>
                  Save an address with a custom label for easy reference
                </Text>
              </VStack>
              <DialogCloseTrigger position="absolute" top={0} right={0} />
            </HStack>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4} alignItems="stretch">
              <FieldRoot invalid={!!labelError}>
                <FieldLabel color="gray.300">Label</FieldLabel>
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
                {labelError && <FieldErrorText>{labelError}</FieldErrorText>}
              </FieldRoot>

              <FieldRoot invalid={!!addressError}>
                <FieldLabel color="gray.300">Address</FieldLabel>
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
                  <FieldErrorText>{addressError}</FieldErrorText>
                )}
              </FieldRoot>
            </VStack>
          </DialogBody>
          <DialogFooter>
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
              loading={isSigning || isSubmitting}
            >
              Add Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
