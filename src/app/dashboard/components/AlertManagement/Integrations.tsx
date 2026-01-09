"use client";

import { useState } from "react";
import { Box, Heading, Text, HStack, VStack, SimpleGrid, Checkbox, TabPanel } from "@chakra-ui/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/app/components/Button";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { CreateIntegrationDialog } from "../../integrations/Dialog";
import { INTEGRATIONS } from "../../../../../convex/data/integrations";
interface IntegrationsProps {
  selectedIntegrationIds: Id<"team_integrations">[];
  setSelectedIntegrationIds: (ids: Id<"team_integrations">[]) => void;
  teamIntegrations: any[];
  // Optional props
  showPreview?: boolean;
  previewComponent?: React.ReactNode;
  // Wrapper props
  wrapper?: "div" | "TabPanel";
  wrapperProps?: any;
}

export function Integrations({
  selectedIntegrationIds,
  setSelectedIntegrationIds,
  teamIntegrations,
  showPreview = false,
  previewComponent,
  wrapper = "div",
  wrapperProps = {},
}: IntegrationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleIntegrationToggle = (id: Id<"team_integrations">) => {
    if (selectedIntegrationIds.includes(id)) {
      setSelectedIntegrationIds(selectedIntegrationIds.filter((i: Id<"team_integrations">) => i !== id));
    } else {
      setSelectedIntegrationIds([...selectedIntegrationIds, id]);
    }
  };

  const content = (
    <>
      <VStack alignItems="stretch" gap={6}>
        {showPreview && previewComponent}

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
              const integration = INTEGRATIONS[teamIntegration.integration_id_new!];

              if (!integration) return null;

              const isSelected = selectedIntegrationIds.includes(teamIntegration._id);

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
                    <Checkbox
                      isChecked={isSelected}
                      onChange={() => handleIntegrationToggle(teamIntegration._id)}
                      borderColor="gray.600"
                    />
                    <Box width="24px" height="24px">
                      <IntegrationIcon name={integration?.name || "Unknown"} />
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
      </VStack>

      <CreateIntegrationDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} />
    </>
  );

  if (wrapper === "TabPanel") {
    return (
      <>
        <TabPanel {...wrapperProps}>{content}</TabPanel>
      </>
    );
  }

  return <div {...wrapperProps}>{content}</div>;
}
