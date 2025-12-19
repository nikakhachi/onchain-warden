"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { isAddress } from "viem";
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Input,
  FieldRoot,
  FieldLabel,
  FieldErrorText,
  DialogRoot,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { CREATE_OWNER_ADDRESS_SIGN_MESSAGE } from "../../constants";

export default function AddressesPage() {
  const { isConnected, address, signMessage, isSigning } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [labelError, setLabelError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const ownerAddresses = useQuery(
    api.ownerAddresses.getOwnerAddressessByOwner,
    address ? { owner: address } : "skip"
  );
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

      alert("Success: Address added successfully!");

      setNewLabel("");
      setNewAddress("");
      setLabelError("");
      setAddressError("");
      setIsOpen(false);
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

  if (!isConnected || !address) {
    return (
      <Box flex={1} paddingY={8}>
        <Container maxW="6xl">
          <Box
            padding={8}
            textAlign="center"
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text color="gray.400">Connect your wallet to view addresses</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  if (ownerAddresses === undefined) {
    return (
      <Box flex={1} paddingY={8}>
        <Container maxW="6xl">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            padding={12}
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Spinner size="xl" color="blue.400" />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="6xl">
        <HStack
          justifyContent="space-between"
          alignItems="center"
          marginBottom={8}
        >
          <Heading as="h1" size="xl" color="white">
            Addresses
          </Heading>
          <Button
            colorScheme="blue"
            onClick={() => setIsOpen(true)}
            backgroundColor="blue.500"
            color="white"
            _hover={{ backgroundColor: "blue.600" }}
          >
            + Add Address
          </Button>
        </HStack>

        {ownerAddresses.length === 0 ? (
          <Box
            padding={8}
            textAlign="center"
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text color="gray.400" marginBottom={4}>
              You don't have any saved addresses yet.
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => setIsOpen(true)}
              backgroundColor="blue.500"
              color="white"
              _hover={{ backgroundColor: "blue.600" }}
            >
              Add Your First Address
            </Button>
          </Box>
        ) : (
          <VStack gap={4} alignItems="stretch">
            {ownerAddresses.map((ownerAddress) => (
              <Box
                key={ownerAddress._id}
                padding={6}
                borderRadius="lg"
                backgroundColor="gray.800"
                borderWidth="1px"
                borderColor="gray.700"
                transition="all 0.3s"
                _hover={{
                  borderColor: "blue.500",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                }}
              >
                <VStack alignItems="flex-start" gap={2}>
                  <Heading as="h3" size="md" color="white">
                    {ownerAddress.label}
                  </Heading>
                  <Text
                    fontSize="sm"
                    fontFamily="mono"
                    color="blue.400"
                    wordBreak="break-all"
                    backgroundColor="gray.900"
                    padding={3}
                    borderRadius="md"
                    width="100%"
                  >
                    {ownerAddress.address}
                  </Text>
                </VStack>
              </Box>
            ))}
          </VStack>
        )}

        {/* Add Address Dialog */}
        <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
          <DialogBackdrop />
          <DialogContent
            backgroundColor="gray.800"
            borderColor="gray.700"
            borderWidth="1px"
            color="white"
            maxW="500px"
          >
            <DialogHeader>
              <DialogTitle>Add Address</DialogTitle>
              <DialogCloseTrigger />
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
                    borderColor={labelError ? "red.500" : "gray.700"}
                    backgroundColor="gray.900"
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
                    borderColor={addressError ? "red.500" : "gray.700"}
                    backgroundColor="gray.900"
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
                onClick={() => setIsOpen(false)}
                variant="ghost"
                color="gray.400"
                _hover={{ color: "white" }}
                marginRight={3}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                colorScheme="blue"
                loading={isSigning || isSubmitting}
                backgroundColor="blue.500"
                color="white"
                _hover={{ backgroundColor: "blue.600" }}
              >
                Add Address
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogRoot>
      </Container>
    </Box>
  );
}
