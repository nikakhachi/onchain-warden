"use client";

import { Fragment, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Input,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { Button } from "../../components/Button";
import { CreateIntegrationDialog } from "./Dialog";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";

export default function IntegrationsPage() {
  const { address } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const integrations = useQuery(api.integrations.getIntegrations);
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
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
            <Heading as="h2" size="xl" color="white">
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

        {!ownerIntegrations?.length ? (
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
                const integration = integrations?.find(
                  (i) => i._id === ownerIntegration.integration_id
                );
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
                        <Box width="30px" height="30px">
                          <IntegrationIcon name={integration?.name || ""} />
                        </Box>
                        <VStack alignItems="flex-start" gap={1}>
                          <Heading as="h3" size="md" color="white">
                            {ownerIntegration.label}
                          </Heading>
                          <Text color="gray.400" fontSize="sm">
                            {integration?.name}
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
                      {Object.keys(ownerIntegration.data).map((key) => (
                        <Fragment key={key}>
                          <Text fontSize="sm" color="gray.400">
                            {key}
                          </Text>
                          <Input
                            value={ownerIntegration.data[key]}
                            readOnly
                            backgroundColor="gray.950"
                            borderColor="gray.800"
                            color="white"
                            fontFamily="mono"
                            fontSize="sm"
                            marginBottom={2}
                          />
                        </Fragment>
                      ))}
                    </VStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </VStack>
        )}

        <CreateIntegrationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </Container>
    </Box>
  );
}
