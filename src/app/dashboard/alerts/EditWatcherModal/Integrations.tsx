import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { useUser } from "@/app/providers/UserContext";
import { TabPanel, VStack, HStack, Box, SimpleGrid, Checkbox, Text } from "@chakra-ui/react";
import { Button as CustomButton } from "../../../components/Button";
import { Id } from "../../../../../convex/_generated/dataModel";
import { CreateIntegrationDialog } from "../../integrations/Dialog";
import { useState } from "react";

export const Integrations = ({
  selectedIntegrationIds,
  setSelectedIntegrationIds,
}: {
  selectedIntegrationIds: Id<"team_integrations">[];
  setSelectedIntegrationIds: (selectedIntegrationIds: Id<"team_integrations">[]) => void;
}) => {
  const { teamIntegrations, integrations } = useUser();

  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);

  const toggleIntegration = (id: Id<"team_integrations">) => {
    if (selectedIntegrationIds.includes(id)) {
      setSelectedIntegrationIds(selectedIntegrationIds.filter((i) => i !== id));
    } else {
      setSelectedIntegrationIds([...selectedIntegrationIds, id]);
    }
  };

  return (
    <>
      <TabPanel paddingX={0} paddingTop={4}>
        <VStack gap={4} alignItems="stretch">
          <HStack justifyContent="space-between" alignItems="center" width="100%">
            <Text color="gray.300" fontSize="sm" fontWeight="500">
              Select integrations
            </Text>
            <CustomButton variant="primary" size="sm" onClick={() => setIsIntegrationDialogOpen(true)}>
              + Add Integration
            </CustomButton>
          </HStack>
          {teamIntegrations && teamIntegrations.length > 0 ? (
            <Box maxH="400px" overflowY="auto">
              <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} gap={3}>
                {teamIntegrations.map((teamIntegration: any) => {
                  const integration = integrations?.find((i: any) => i._id === teamIntegration.integration_id);
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
                      onClick={() => toggleIntegration(teamIntegration._id)}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: isSelected ? "blue.500" : "gray.600",
                      }}
                    >
                      <HStack gap={4} alignItems="center">
                        <Checkbox
                          isChecked={isSelected}
                          onChange={() => toggleIntegration(teamIntegration._id)}
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
            </Box>
          ) : (
            <Box
              padding={8}
              textAlign="center"
              borderRadius="xl"
              backgroundColor="gray.800"
              borderWidth="1px"
              borderColor="gray.700"
            >
              <Text color="gray.400" fontSize="sm">
                You don't have any integrations yet.
              </Text>
            </Box>
          )}
        </VStack>
      </TabPanel>
      <CreateIntegrationDialog isOpen={isIntegrationDialogOpen} onClose={() => setIsIntegrationDialogOpen(false)} />
    </>
  );
};
