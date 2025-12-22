"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { Button } from "../../components/Button";
import { AddAddressDialog } from "./Dialog";
import { AddressMenu } from "./AddressMenu";

export default function AddressesPage() {
  const { address } = useWallet();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const ownerAddresses = useQuery(
    api.ownerAddresses.getOwnerAddressessByOwner,
    address ? { owner: address } : "skip"
  );

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <VStack alignItems="flex-start" gap={2} marginBottom={8}>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Heading as="h1" size="lg" color="white">
              Addresses
            </Heading>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddOpen(true)}
            >
              + Add Address
            </Button>
          </HStack>
          <Text color="gray.400" fontSize="sm">
            Label frequently used addresses
          </Text>
        </VStack>

        {ownerAddresses === undefined ? (
          <Box
            padding={12}
            textAlign="center"
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <Spinner size="lg" color="blue.500" />
          </Box>
        ) : !ownerAddresses?.length ? (
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
              onClick={() => setIsAddOpen(true)}
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
            <Box
              display="grid"
              gridTemplateColumns="0.9fr 1.7fr 0.5fr"
              paddingX={6}
              paddingY={4}
              borderBottomWidth="1px"
              borderBottomColor="gray.800"
              backgroundColor="gray.900"
              alignItems="center"
            >
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Label
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Address
              </Text>
              <Box display="flex" justifyContent="flex-end">
                <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                  Actions
                </Text>
              </Box>
            </Box>

            <VStack gap={0} alignItems="stretch">
              {ownerAddresses?.map((ownerAddress) => {
                return (
                  <Box
                    key={ownerAddress._id}
                    display="grid"
                    gridTemplateColumns="0.9fr 1.7fr 0.5fr"
                    paddingX={6}
                    paddingY={4}
                    borderBottomWidth="1px"
                    borderBottomColor="gray.800"
                    _hover={{ backgroundColor: "gray.850" }}
                    _last={{ borderBottomWidth: "0" }}
                    alignItems="center"
                  >
                    <Box minWidth={0} overflow="hidden">
                      <Text
                        color="white"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {ownerAddress.label}
                      </Text>
                    </Box>
                    <Box minWidth={0} overflow="hidden">
                      <Text
                        color="white"
                        fontSize="sm"
                        fontFamily="mono"
                        onClick={() => {
                          navigator.clipboard.writeText(ownerAddress.address);
                        }}
                        cursor="pointer"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {ownerAddress.address}
                      </Text>
                    </Box>
                    <Box minWidth={0} display="flex" justifyContent="flex-end">
                      <AddressMenu
                        addressId={ownerAddress._id}
                        label={ownerAddress.label}
                        address={ownerAddress.address}
                      />
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        <AddAddressDialog
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
        />
      </Container>
    </Box>
  );
}
