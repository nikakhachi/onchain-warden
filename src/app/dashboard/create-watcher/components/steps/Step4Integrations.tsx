"use client";

import {
  Box,
  Heading,
  Text,
  HStack,
  VStack,
  RadioGroup,
  Radio,
  Flex,
} from "@chakra-ui/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";

function getEventName(abi: string) {
  try {
    const match = abi.match(/event\s+(\w+)\s*\(/);
    return match ? match[1] : "Unknown Event";
  } catch (e) {
    return "Unknown Event";
  }
}

const getOperatorLabel = (op: string) => {
  const labels: Record<string, string> = {
    "==": "Equals",
    "!=": "Not Equals",
    ">": "Greater Than",
    ">=": "Greater Than or Equal",
    "<": "Less Than",
    "<=": "Less Than or Equal",
  };
  return labels[op] || op;
};

export function Step4Integrations() {
  const {
    ownerIntegrations,
    selectedOwnerIntegrationIds,
    setSelectedOwnerIntegrationIds,
    integrations,
    watcherLabel,
    selectedChain,
    chainId,
    contractAddress,
    eventAbi,
    conditions,
    eventArgs,
  } = useCreateWatcher();

  const handleIntegrationToggle = (id: Id<"owner_integrations">) => {
    if (selectedOwnerIntegrationIds.includes(id)) {
      setSelectedOwnerIntegrationIds(
        selectedOwnerIntegrationIds.filter(
          (i: Id<"owner_integrations">) => i !== id
        )
      );
    } else {
      setSelectedOwnerIntegrationIds([...selectedOwnerIntegrationIds, id]);
    }
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Preview Section */}
      <Box
        padding={4}
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Flex gap={6} flexWrap="wrap" alignItems="flex-end">
          {watcherLabel && (
            <VStack alignItems="flex-start" gap={1}>
              <Text color="gray.400" fontSize="xs">
                Label
              </Text>
              <Text color="white" fontSize="sm" fontWeight="500">
                {watcherLabel}
              </Text>
            </VStack>
          )}
          <VStack alignItems="flex-start" gap={1}>
            <Text color="gray.400" fontSize="xs">
              Chain
            </Text>
            <Text color="white" fontSize="sm" fontWeight="500">
              {selectedChain?.name || chainId}
            </Text>
          </VStack>
          <VStack alignItems="flex-start" gap={1}>
            <Text color="gray.400" fontSize="xs">
              Contract
            </Text>
            <Text
              color="blue.400"
              fontSize="sm"
              fontFamily="mono"
              wordBreak="break-all"
            >
              {contractAddress}
            </Text>
          </VStack>
          <VStack alignItems="flex-start" gap={1}>
            <Text color="gray.400" fontSize="xs">
              Event
            </Text>
            <Text color="blue.400" fontSize="sm" fontWeight="500">
              {getEventName(eventAbi)}
            </Text>
          </VStack>
          {conditions.length > 0 && (
            <VStack alignItems="flex-start" gap={1} marginLeft={4}>
              <Text color="gray.400" fontSize="xs">
                Conditions
              </Text>
              <HStack gap={3} flexWrap="wrap" alignItems="center">
                {conditions.map((condition: any, index: number) => {
                  const arg = eventArgs.find(
                    (a: any) =>
                      a.name === condition.field ||
                      a.internalType === condition.field
                  );
                  return (
                    <HStack key={index} gap={1.5} alignItems="center">
                      <Text color="white" fontSize="sm" fontFamily="mono">
                        {arg?.name || condition.field}
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        {getOperatorLabel(condition.operator)}
                      </Text>
                      <Text color="blue.400" fontSize="sm" fontFamily="mono">
                        {condition.value}
                      </Text>
                    </HStack>
                  );
                })}
              </HStack>
            </VStack>
          )}
        </Flex>
      </Box>

      <VStack alignItems="flex-start" gap={2}>
        <Heading as="h3" size="md" color="white">
          Select Integrations
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Choose where you want to receive notifications for this watcher
        </Text>
      </VStack>

      {ownerIntegrations && ownerIntegrations.length > 0 ? (
        <VStack alignItems="stretch" gap={4}>
          {ownerIntegrations.map((ownerIntegration: any) => {
            const integration = integrations?.find(
              (i: { _id: Id<"integrations">; name: string }) =>
                i._id === ownerIntegration.integration_id
            );
            const isSelected = selectedOwnerIntegrationIds.includes(
              ownerIntegration._id
            );

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
                  <RadioGroup
                    value={isSelected ? ownerIntegration._id : ""}
                    colorScheme="blue"
                  >
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
                      {ownerIntegration.data?.chatId ||
                        ownerIntegration.data?.chat_id ||
                        "N/A"}
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
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.location.href = "/dashboard/integrations";
            }}
          >
            Add New Integration
          </Button>
        </Box>
      )}
    </VStack>
  );
}
