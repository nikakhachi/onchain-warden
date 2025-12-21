"use client";

import { useState, useEffect } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
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

interface UpdateAddressDialogProps {
  isOpen: boolean;
  onClose: () => void;
  addressId: Id<"owner_addresses"> | null;
  initialLabel: string;
  initialAddress: string;
}

export function UpdateAddressDialog({
  isOpen,
  onClose,
  addressId,
  initialLabel,
  initialAddress,
}: UpdateAddressDialogProps) {
  const { address, signMessage, isSigning } = useWallet();
  const [label, setLabel] = useState(initialLabel);
  const [addressValue, setAddressValue] = useState(initialAddress);
  const [labelError, setLabelError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOwnerAddress = useAction(
    api.ownerAddresses.updateOwnerAddressAction
  );

  // Update form when initial values change
  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setAddressValue(initialAddress);
      setLabelError("");
      setAddressError("");
    }
  }, [isOpen, initialLabel, initialAddress]);

  const validateLabel = (labelValue: string) => {
    if (!labelValue.trim()) {
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
    if (!address || !addressId) {
      alert("Error: Wallet not connected or address ID missing.");
      return;
    }

    const isLabelValid = validateLabel(label);
    const isAddressValid = validateAddress(addressValue);

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

      await updateOwnerAddress({
        id: addressId,
        label: label.trim(),
        address: addressValue.trim(),
        owner: address,
        signature,
      });

      setLabel("");
      setAddressValue("");
      setLabelError("");
      setAddressError("");
      onClose();
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to update address"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLabel(initialLabel);
    setAddressValue(initialAddress);
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
                  Update Address
                </DialogTitle>
                <Text color="gray.400" fontSize="sm" marginTop={0}>
                  Update the label or address for this saved address
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
                  value={label}
                  onChange={(e) => {
                    setLabel(e.target.value);
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
                  value={addressValue}
                  onChange={(e) => {
                    setAddressValue(e.target.value);
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
              Update Address
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}

