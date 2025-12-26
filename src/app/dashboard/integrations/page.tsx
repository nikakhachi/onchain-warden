"use client";

import { useState } from "react";
import { Box, Container, VStack, HStack, Text, Spinner } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { Button } from "../../components/Button";
import { CreateIntegrationDialog } from "./Dialog";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { IntegrationMenu } from "./IntegrationMenu";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Id } from "../../../../convex/_generated/dataModel";

export default function IntegrationsPage() {
  const [isOpen, setIsOpen] = useState(false);

  const { integrations, ownerIntegrations, watchers } = useUser();

  // Helper function to count watchers for a specific owner integration
  const getWatcherCount = (ownerIntegrationId: Id<"owner_integrations">) => {
    if (!watchers) return 0;
    return watchers.filter((watcher) => watcher.eventWatcher.owner_integration_ids.includes(ownerIntegrationId)).length;
  };

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader
          title="Integrations"
          description="Connect notification channels for your alerts"
          buttonLabel="+ Add Integration"
          onClick={() => setIsOpen(true)}
        />

        {ownerIntegrations === undefined || integrations === undefined || watchers === undefined ? (
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
          <Box borderRadius="2xl" backgroundColor="gray.900" borderWidth="1px" borderColor="gray.800" overflow="hidden">
            <Box
              display="grid"
              gridTemplateColumns="1.2fr 1fr 1.5fr 0.8fr 0.5fr"
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
              <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                Connected Alerts
              </Text>
              <Box display="flex" justifyContent="flex-end">
                <Text color="gray.400" fontSize="sm" fontWeight="semibold">
                  Actions
                </Text>
              </Box>
            </Box>

            <VStack gap={0} alignItems="stretch">
              {ownerIntegrations.map((ownerIntegration) => {
                const integration = integrations?.find((i) => i._id === ownerIntegration.integration_id);
                const dataKeys = Object.keys(ownerIntegration.data);
                const dataPreview =
                  dataKeys.length > 0
                    ? `${dataKeys[0]}: ${ownerIntegration.data[dataKeys[0]].slice(0, 20)}${ownerIntegration.data[dataKeys[0]].length > 20 ? "..." : ""}`
                    : "No data";

                return (
                  <Box
                    key={ownerIntegration._id}
                    display="grid"
                    gridTemplateColumns="1.2fr 1fr 1.5fr 0.8fr 0.5fr"
                    paddingX={6}
                    paddingY={4}
                    borderBottomWidth="1px"
                    borderBottomColor="gray.800"
                    _hover={{ backgroundColor: "gray.850" }}
                    _last={{ borderBottomWidth: "0" }}
                    alignItems="center"
                  >
                    <Box minWidth={0} overflow="hidden">
                      <Text color="white" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
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
                    <Box minWidth={0} display="flex" alignItems="center">
                      <Text color="gray.300" fontSize="sm" fontWeight="medium">
                        {getWatcherCount(ownerIntegration._id)}
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

        <CreateIntegrationDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </Container>
    </Box>
  );
}
