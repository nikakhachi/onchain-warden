"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getAddress } from "viem";
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { CREATE_OWNER_INTEGRATION_SIGN_MESSAGE } from "../../constants";
import { CreateIntegrationModal } from "../../components/CreateIntegrationModal";

export default function IntegrationsPage() {
  const { isConnected, address, signMessage, isSigning } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const integrations = useQuery(api.integrations.getIntegrations);
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    address ? { owner: address } : "skip"
  );

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
            <Text color="gray.400">Connect your wallet to view integrations</Text>
          </Box>
        </Container>
      </Box>
    );
  }

  if (integrations === undefined || ownerIntegrations === undefined) {
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
        <HStack justifyContent="space-between" alignItems="center" marginBottom={8}>
          <Heading as="h1" size="xl" color="white">
            Integrations
          </Heading>
          <Button
            colorScheme="blue"
            onClick={() => setIsOpen(true)}
            backgroundColor="blue.500"
            color="white"
            _hover={{ backgroundColor: "blue.600" }}
          >
            + Add Integration
          </Button>
        </HStack>

        {ownerIntegrations.length === 0 ? (
          <Box
            padding={8}
            textAlign="center"
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text color="gray.400" marginBottom={4}>
              You don't have any integrations yet.
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => setIsOpen(true)}
              backgroundColor="blue.500"
              color="white"
              _hover={{ backgroundColor: "blue.600" }}
            >
              Create Your First Integration
            </Button>
          </Box>
        ) : (
          <VStack gap={4} alignItems="stretch">
            {ownerIntegrations.map((ownerIntegration) => {
              const integration = integrations.find(
                (i) => i._id === ownerIntegration.integration_id
              );
              return (
                <Box
                  key={ownerIntegration._id}
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
                  <HStack justifyContent="space-between" alignItems="flex-start">
                    <VStack alignItems="flex-start" gap={2} flex={1}>
                      <HStack gap={3}>
                        <Heading as="h3" size="md" color="white">
                          {ownerIntegration.label}
                        </Heading>
                        <Badge
                          colorScheme="blue"
                          backgroundColor="blue.500"
                          color="white"
                        >
                          {integration?.name || "Unknown"}
                        </Badge>
                      </HStack>
                      <Box
                        padding={3}
                        borderRadius="md"
                        backgroundColor="gray.900"
                        width="100%"
                      >
                        <Text
                          fontSize="xs"
                          color="gray.400"
                          fontFamily="mono"
                          wordBreak="break-all"
                        >
                          {JSON.stringify(ownerIntegration.data, null, 2)}
                        </Text>
                      </Box>
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        )}

        <CreateIntegrationModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </Container>
    </Box>
  );
}

