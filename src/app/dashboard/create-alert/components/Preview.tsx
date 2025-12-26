"use client";

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { useCreateWatcher } from "./context/CreateWatcherContext";
import { READY_EVENTS } from "../../../data/readyEvents";
import { ChainIcon } from "@/app/icons/ChainIcon";

function getEventName(abi: string) {
  if (!abi) return "Unknown Event";
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

export function Preview() {
  const {
    watcherLabel,
    selectedChain,
    chainId,
    contractAddress,
    eventAbi,
    conditions,
    eventArgs,
    useTemplate,
    selectedTemplateIndex,
  } = useCreateWatcher();

  // Get the event ABI to display - use template's if available and eventAbi is empty
  const displayEventAbi =
    eventAbi || (useTemplate && selectedTemplateIndex !== null ? READY_EVENTS[selectedTemplateIndex]?.event_abi : "");

  return (
    <Box padding={4} borderRadius="lg" backgroundColor="gray.800" borderWidth="1px" borderColor="gray.700">
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
          <HStack gap={2} flexWrap="wrap">
            <Box width="16px" height="16px">
              <ChainIcon name={selectedChain?.name} />
            </Box>
            <Text color="white" fontSize="sm" fontWeight="500">
              {selectedChain?.name || chainId}
            </Text>
          </HStack>
        </VStack>
        <VStack alignItems="flex-start" gap={1}>
          <Text color="gray.400" fontSize="xs">
            Contract
          </Text>
          <Text color="blue.400" fontSize="sm" fontFamily="mono" wordBreak="break-all">
            {contractAddress}
          </Text>
        </VStack>
        <VStack alignItems="flex-start" gap={1}>
          <Text color="gray.400" fontSize="xs">
            Event
          </Text>
          <Text color="blue.400" fontSize="sm" fontWeight="500">
            {getEventName(displayEventAbi)}
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
                  (a: any) => a.name === condition.field || a.internalType === condition.field,
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
  );
}
