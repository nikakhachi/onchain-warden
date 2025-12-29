"use client";

import { useState } from "react";
import { Box, Heading, Text, HStack, VStack, RadioGroup, Radio } from "@chakra-ui/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { Preview } from "../Preview";
import { CreateIntegrationDialog } from "../../../integrations/Dialog";
import { IntegrationData } from "@/app/enums";

export function Step4Integrations() {
  const { ownerIntegrations, selectedOwnerIntegrationIds, setSelectedOwnerIntegrationIds, integrations } =
    useCreateWatcher();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIntegrationToggle = (id: Id<"owner_integrations">) => {
    if (selectedOwnerIntegrationIds.includes(id)) {
      setSelectedOwnerIntegrationIds(selectedOwnerIntegrationIds.filter((i: Id<"owner_integrations">) => i !== id));
    } else {
      setSelectedOwnerIntegrationIds([...selectedOwnerIntegrationIds, id]);
    }
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      <Preview />

      <VStack alignItems="flex-start" gap={2}>
        <HStack justifyContent="space-between" alignItems="center" width="100%">
          <VStack alignItems="flex-start" gap={1}>
            <Heading as="h3" size="md" color="white">
              Select Integrations
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Choose where you want to receive notifications for this watcher
            </Text>
          </VStack>
          <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(true)}>
            + Add Integration
          </Button>
        </HStack>
      </VStack>

      {ownerIntegrations && ownerIntegrations.length > 0 ? (
        <VStack alignItems="stretch" gap={4}>
          {ownerIntegrations.map((ownerIntegration: any) => {
            const integration = integrations?.find(
              (i: { _id: Id<"integrations">; name: string }) => i._id === ownerIntegration.integration_id,
            );
            const isSelected = selectedOwnerIntegrationIds.includes(ownerIntegration._id);

            return (
              <Box
                key={ownerIntegration._id}
                padding={6}
                borderRadius="xl"
                backgroundColor="gray.800"
                borderWidth="2px"
                borderColor={isSelected ? "blue.500" : "gray.700"}
                cursor="pointer"
                onClick={() => handleIntegrationToggle(ownerIntegration._id)}
                transition="all 0.2s"
                _hover={{
                  borderColor: isSelected ? "blue.500" : "gray.600",
                }}
              >
                <HStack gap={4}>
                  <RadioGroup value={isSelected ? ownerIntegration._id : ""} colorScheme="blue">
                    <Radio value={ownerIntegration._id} />
                  </RadioGroup>
                  <Box width="40px" height="40px">
                    <IntegrationIcon name={integration?.name} />
                  </Box>
                  <VStack alignItems="flex-start" gap={1} flex={1}>
                    <Text color="white" fontWeight="500">
                      {ownerIntegration.label}
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      {integration?.name || "Telegram"} • Chat ID:{" "}
                      {ownerIntegration.data?.[IntegrationData.TELEGRAM] || "N/A"}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      ) : (
        <Box
          padding={8}
          textAlign="center"
          borderRadius="xl"
          backgroundColor="gray.800"
          borderWidth="1px"
          borderColor="gray.700"
        >
          <Text color="gray.400" marginBottom={4}>
            You don't have any integrations yet.
          </Text>
          <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(true)}>
            Add New Integration
          </Button>
        </Box>
      )}

      <CreateIntegrationDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </VStack>
  );
}
