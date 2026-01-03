"use client";

import { useState } from "react";
import { Box, Heading, Text, HStack, VStack, SimpleGrid, CheckboxGroup, Checkbox } from "@chakra-ui/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { Preview } from "../Preview";
import { CreateIntegrationDialog } from "../../../integrations/Dialog";

export function Step4Integrations() {
  const { teamIntegrations, selectedTeamIntegrationIds, setSelectedTeamIntegrationIds, integrations } =
    useCreateWatcher();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIntegrationToggle = (id: Id<"team_integrations">) => {
    if (selectedTeamIntegrationIds.includes(id)) {
      setSelectedTeamIntegrationIds(selectedTeamIntegrationIds.filter((i: Id<"team_integrations">) => i !== id));
    } else {
      setSelectedTeamIntegrationIds([...selectedTeamIntegrationIds, id]);
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

      {teamIntegrations && teamIntegrations.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={3}>
          {teamIntegrations.map((teamIntegration: any) => {
            const integration = integrations?.find(
              (i: { _id: Id<"integrations">; name: string }) => i._id === teamIntegration.integration_id,
            );
            const isSelected = selectedTeamIntegrationIds.includes(teamIntegration._id);

            return (
              <Box
                key={teamIntegration._id}
                padding={4}
                borderRadius="xl"
                backgroundColor="gray.800"
                borderWidth="2px"
                borderColor={isSelected ? "blue.500" : "gray.700"}
                cursor="pointer"
                onClick={() => handleIntegrationToggle(teamIntegration._id)}
                transition="all 0.2s"
                _hover={{
                  borderColor: isSelected ? "blue.500" : "gray.600",
                }}
              >
                <HStack gap={4} alignItems="center">
                  <CheckboxGroup value={isSelected ? teamIntegration._id : ""} colorScheme="blue">
                    <Checkbox value={teamIntegration._id} />
                  </CheckboxGroup>
                  <Box width="24px" height="24px">
                    <IntegrationIcon name={integration?.name} />
                  </Box>
                  <VStack alignItems="flex-start" gap={0} flex={1}>
                    <Text color="white" fontWeight="500" fontSize="sm">
                      {teamIntegration.label}
                    </Text>
                    <Text color="gray.400" fontSize="xs">
                      {integration?.name}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>
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
