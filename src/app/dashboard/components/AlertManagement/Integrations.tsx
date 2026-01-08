"use client";

import { useState } from "react";
import { Box, Heading, Text, HStack, VStack, SimpleGrid, Checkbox, TabPanel } from "@chakra-ui/react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/app/components/Button";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { CreateIntegrationDialog } from "../../integrations/Dialog";
import { SimulateModal } from "../SimulateModal";

interface IntegrationsProps {
  selectedIntegrationIds: Id<"team_integrations">[];
  setSelectedIntegrationIds: (ids: Id<"team_integrations">[]) => void;
  teamIntegrations: any[];
  integrations: any[];
  // Optional props for simulation
  canSimulate?: boolean;
  onSimulate?: (teamIntegrationId: Id<"team_integrations">, blockNumber: number) => void;
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
  integrations,
  canSimulate = false,
  onSimulate,
  showPreview = false,
  previewComponent,
  wrapper = "div",
  wrapperProps = {},
}: IntegrationsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSimulateIntegration, setSelectedSimulateIntegration] = useState<{
    id: Id<"team_integrations">;
    label: string;
  } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleIntegrationToggle = (id: Id<"team_integrations">) => {
    if (selectedIntegrationIds.includes(id)) {
      setSelectedIntegrationIds(selectedIntegrationIds.filter((i: Id<"team_integrations">) => i !== id));
    } else {
      setSelectedIntegrationIds([...selectedIntegrationIds, id]);
    }
  };

  const handleSimulateClick = (e: React.MouseEvent, teamIntegration: any) => {
    e.stopPropagation();
    setSelectedSimulateIntegration({ id: teamIntegration._id, label: teamIntegration.label });
  };

  const handleSimulate = async (blockNumber: number) => {
    if (!selectedSimulateIntegration || !onSimulate) return;
    setIsSimulating(true);
    try {
      await onSimulate(selectedSimulateIntegration.id, blockNumber);
      setSelectedSimulateIntegration(null);
    } catch (error) {
      // Error handling will be done in UserContext
    } finally {
      setIsSimulating(false);
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
              const integration = integrations?.find(
                (i: { _id: Id<"integrations">; name: string }) => i._id === teamIntegration.integration_id,
              );
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

                    {canSimulate && onSimulate && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => handleSimulateClick(e, teamIntegration)}
                        disabled={!canSimulate}
                      >
                        Simulate
                      </Button>
                    )}
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
      {selectedSimulateIntegration && (
        <SimulateModal
          isOpen={!!selectedSimulateIntegration}
          onClose={() => setSelectedSimulateIntegration(null)}
          onSimulate={handleSimulate}
          isSubmitting={isSimulating}
          integrationLabel={selectedSimulateIntegration.label}
        />
      )}
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
