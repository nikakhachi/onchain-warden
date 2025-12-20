"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { isAddress } from "viem";
import {
  Box,
  Container,
  Heading,
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
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
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
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
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
        <VStack alignItems="flex-start" gap={2} marginBottom={8}>
          <HStack justifyContent="space-between" alignItems="center" width="100%">
            <Heading as="h1" size="xl" color="white">
              Addresses
            </Heading>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsOpen(true)}
            >
              + Add Address
            </Button>
          </HStack>
          <Text color="gray.400" fontSize="sm">
            Save and label frequently used addresses
          </Text>
        </VStack>

        {ownerAddresses.length === 0 ? (
          <Box
            padding={8}
            textAlign="center"
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <Text color="gray.400" marginBottom={4}>
              You don't have any saved addresses yet.
            </Text>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsOpen(true)}
            >
              Add Your First Address
            </Button>
          </Box>
        ) : (
          <Box
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
            overflow="hidden"
          >
            {/* Table Header */}
            <Box
              display="grid"
              gridTemplateColumns="1fr 1fr 1fr"
              paddingX={6}
              paddingY={4}
              borderBottomWidth="1px"
              borderBottomColor="gray.800"
              backgroundColor="gray.900"
            >
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Label
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Address
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Added
              </Text>
            </Box>

            {/* Table Body */}
            <VStack gap={0} alignItems="stretch">
              {ownerAddresses.map((ownerAddress) => {
                const addedDate = new Date(ownerAddress._creationTime);
                const formattedDate = addedDate.toISOString().split("T")[0];
                const truncatedAddress = `${ownerAddress.address.slice(0, 6)}...${ownerAddress.address.slice(-4)}`;
                
                return (
                  <Box
                    key={ownerAddress._id}
                    display="grid"
                    gridTemplateColumns="1fr 1fr 1fr"
                    paddingX={6}
                    paddingY={4}
                    borderBottomWidth="1px"
                    borderBottomColor="gray.800"
                    _hover={{ backgroundColor: "gray.850" }}
                    _last={{ borderBottomWidth: "0" }}
                  >
                    <Box>
                      <HStack gap={2}>
                        <Text fontSize="lg">📍</Text>
                        <Text color="white">{ownerAddress.label}</Text>
                      </HStack>
                    </Box>
                    <Box>
                      <HStack gap={2}>
                        <Text
                          fontFamily="mono"
                          color="blue.400"
                          fontSize="sm"
                        >
                          {truncatedAddress}
                        </Text>
                        <Box
                          as="button"
                          cursor="pointer"
                          padding={1}
                          borderRadius="md"
                          _hover={{ backgroundColor: "gray.800" }}
                          onClick={() => {
                            navigator.clipboard.writeText(ownerAddress.address);
                          }}
                        >
                          <Text fontSize="sm" color="gray.400">📋</Text>
                        </Box>
                      </HStack>
                    </Box>
                    <Box>
                      <HStack justifyContent="space-between">
                        <Text color="gray.400" fontSize="sm">
                          {formattedDate}
                        </Text>
                        <Box
                          as="button"
                          cursor="pointer"
                          padding={1}
                          borderRadius="md"
                          _hover={{ backgroundColor: "gray.800" }}
                        >
                          <Text fontSize="sm" color="gray.400">⋮</Text>
                        </Box>
                      </HStack>
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* Add Address Dialog */}
        <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
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
            <DialogHeader>
              <DialogTitle>Add Address</DialogTitle>
              <Text color="gray.400" fontSize="sm" marginTop={2}>
                Save an address with a custom label for easy reference.
              </Text>
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
                onClick={() => setIsOpen(false)}
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
      </Container>
    </Box>
  );
}
