"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { Button } from "../../components/Button";
import { CreateIntegrationDialog } from "./Dialog";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { IntegrationMenu } from "./IntegrationMenu";
import { DashboardPageHeader } from "../components/DashboardPageHeader";

export default function IntegrationsPage() {
  const { currentAccount } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const integrations = useQuery(api.integrations.getIntegrations);
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    currentAccount ? { owner: currentAccount } : "skip"
  );

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader
          title="Integrations"
          description="Connect notification channels for your alerts"
          buttonLabel="+ Add Integration"
          onClick={() => setIsOpen(true)}
        />

        {ownerIntegrations === undefined || integrations === undefined ? (
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
        ) : !ownerIntegrations?.length ? (
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
          <Box
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
            overflow="hidden"
          >
            <Box
              display="grid"
              gridTemplateColumns="1.2fr 1fr 1.5fr 0.5fr"
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
                Type
              </Text>
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Data
              </Text>
              <Box display="flex" justifyContent="flex-end">
                <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                  Actions
                </Text>
              </Box>
            </Box>

            <VStack gap={0} alignItems="stretch">
              {ownerIntegrations.map((ownerIntegration) => {
                const integration = integrations?.find(
                  (i) => i._id === ownerIntegration.integration_id
                );
                const dataKeys = Object.keys(ownerIntegration.data);
                const dataPreview =
                  dataKeys.length > 0
                    ? `${dataKeys[0]}: ${ownerIntegration.data[dataKeys[0]].slice(0, 20)}${ownerIntegration.data[dataKeys[0]].length > 20 ? "..." : ""}`
                    : "No data";

                return (
                  <Box
                    key={ownerIntegration._id}
                    display="grid"
                    gridTemplateColumns="1.2fr 1fr 1.5fr 0.5fr"
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
                        {ownerIntegration.label}
                      </Text>
                    </Box>
                    <Box minWidth={0} overflow="hidden">
                      <HStack gap={2} alignItems="center">
                        {integration && (
                          <Box width="20px" height="20px" flexShrink={0}>
                            <IntegrationIcon name={integration.name} />
                          </Box>
                        )}
                        <Text
                          color="gray.400"
                          fontSize="sm"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                        >
                          {integration?.name || "Unknown"}
                        </Text>
                      </HStack>
                    </Box>
                    <Box minWidth={0} overflow="hidden">
                      <Text
                        color="gray.400"
                        fontSize="sm"
                        fontFamily="mono"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {dataPreview}
                      </Text>
                    </Box>
                    <Box minWidth={0} display="flex" justifyContent="flex-end">
                      {integration && (
                        <IntegrationMenu
                          integrationId={ownerIntegration._id}
                          label={ownerIntegration.label}
                          integrationTypeId={ownerIntegration.integration_id}
                          data={ownerIntegration.data}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })}
            </VStack>
          </Box>
        )}

        <CreateIntegrationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </Container>
    </Box>
  );
}
