"use client";

import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { useCreateWatcher } from "./context/CreateWatcherContext";
import { READY_EVENTS } from "../../../shared/data/readyEvents";
import { ChainIcon } from "@/app/icons/ChainIcon";
import { formatAddress, getEventName, getOperatorLabel } from "@/app/shared/helpers";
import { CHAINS_MAP } from "../../../../../convex/data/chains";

export function Preview() {
  const {
    watcherLabel,
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

  const chain = CHAINS_MAP[Number(chainId)];

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
              <ChainIcon name={chain?.name || ""} />
            </Box>
            <Text color="white" fontSize="sm" fontWeight="500">
              {chain?.name || ""}
            </Text>
          </HStack>
        </VStack>
        <VStack alignItems="flex-start" gap={1}>
          <Text color="gray.400" fontSize="xs">
            Contract
          </Text>
          <Text color="blue.400" fontSize="sm" fontFamily="mono" wordBreak="break-all">
            {formatAddress(contractAddress)}
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
