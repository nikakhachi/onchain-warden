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
  VStack,
  HStack,
  Text,
  Spinner,
  Badge,
  SimpleGrid,
  Input,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { CREATE_OWNER_INTEGRATION_SIGN_MESSAGE } from "../../constants";
import { CreateIntegrationModal } from "../../components/CreateIntegrationModal";
import { Button } from "../../components/Button";

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
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <Text color="gray.400">
              Connect your wallet to view integrations
            </Text>
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
          <HStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Heading as="h1" size="xl" color="white">
              Integrations
            </Heading>
            <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
              + Add Integration
            </Button>
          </HStack>
          <Text color="gray.400" fontSize="sm">
            Connect notification channels for your watchers
          </Text>
        </VStack>

        {ownerIntegrations.length === 0 ? (
          <Box
            padding={8}
            textAlign="center"
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <Text color="gray.400" marginBottom={4}>
              You don't have any integrations yet.
            </Text>
            <Button variant="primary" size="md" onClick={() => setIsOpen(true)}>
              Create Your First Integration
            </Button>
          </Box>
        ) : (
          <VStack gap={6} alignItems="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              {ownerIntegrations.map((ownerIntegration) => {
                const integration = integrations.find(
                  (i) => i._id === ownerIntegration.integration_id
                );
                const chatId =
                  ownerIntegration.data?.chatId ||
                  ownerIntegration.data?.chat_id ||
                  "";
                return (
                  <Box
                    key={ownerIntegration._id}
                    padding={6}
                    borderRadius="2xl"
                    backgroundColor="gray.900"
                    borderWidth="1px"
                    borderColor="gray.800"
                    transition="all 0.3s"
                    _hover={{
                      borderColor: "gray.700",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                    }}
                    position="relative"
                  >
                    <HStack
                      justifyContent="space-between"
                      alignItems="flex-start"
                      marginBottom={4}
                    >
                      <HStack gap={3}>
                        <Box
                          width="48px"
                          height="48px"
                          borderRadius="xl"
                          background="linear-gradient(135deg, #3b82f6, #9333ea)"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          fontSize="2xl"
                        >
                          📱
                        </Box>
                        <VStack alignItems="flex-start" gap={1}>
                          <Heading as="h3" size="md" color="white">
                            {ownerIntegration.label}
                          </Heading>
                          <Text color="gray.400" fontSize="sm">
                            {integration?.name || "Telegram"}
                          </Text>
                        </VStack>
                      </HStack>
                      <Box
                        as="button"
                        cursor="pointer"
                        padding={2}
                        borderRadius="md"
                        _hover={{ backgroundColor: "gray.800" }}
                      >
                        <Text fontSize="lg" color="gray.400">
                          ⋮
                        </Text>
                      </Box>
                    </HStack>
                    <VStack alignItems="flex-start" gap={2}>
                      <Text fontSize="sm" color="gray.400">
                        Chat ID
                      </Text>
                      <Input
                        value={chatId}
                        readOnly
                        backgroundColor="gray.950"
                        borderColor="gray.800"
                        color="white"
                        fontFamily="mono"
                        fontSize="sm"
                      />
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>

            {/* Instructions Section */}
            <Box
              padding={6}
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
              marginTop={4}
            >
              <Heading as="h3" size="md" color="white" marginBottom={4}>
                How to get your Telegram Chat ID
              </Heading>
              <VStack alignItems="flex-start" gap={3}>
                <HStack gap={3}>
                  <Text color="gray.400">1.</Text>
                  <Text color="gray.300">
                    Add @ChainAlertBot to your Telegram group or channel
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <Text color="gray.400">2.</Text>
                  <Text color="gray.300">
                    Send the command{" "}
                    <Box
                      as="span"
                      backgroundColor="cyan.500"
                      color="white"
                      paddingX={2}
                      paddingY={1}
                      borderRadius="md"
                      fontFamily="mono"
                      fontSize="sm"
                    >
                      /getchatid
                    </Box>{" "}
                    in the chat
                  </Text>
                </HStack>
                <HStack gap={3}>
                  <Text color="gray.400">3.</Text>
                  <Text color="gray.300">
                    Copy the Chat ID and paste it above
                  </Text>
                </HStack>
              </VStack>
            </Box>
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
