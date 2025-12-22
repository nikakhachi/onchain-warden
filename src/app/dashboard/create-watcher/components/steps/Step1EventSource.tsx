"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  Select,
  Badge,
} from "@chakra-ui/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { READY_EVENTS } from "../../../../data/readyEvents";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";

export function Step1EventSource() {
  const {
    chainId,
    setChainId,
    contractAddress,
    handleAddressChange,
    eventAbi,
    useTemplate,
    setUseTemplate,
    selectedTemplateIndex,
    handleTemplateSelect,
    availableEvents,
    isFetchingEvents,
    eventsFetchError,
    selectedEventIndex,
    handleEventSelect,
    abiFetched,
    handleFetchAbi,
    addressError,
    chains,
    watcherLabel,
    setWatcherLabel,
  } = useCreateWatcher();

  return (
    <VStack alignItems="stretch" gap={4}>
      <Box display="flex" justifyContent="center" width="100%">
        <Box
          display="flex"
          gap={2}
          padding={1.5}
          borderRadius="lg"
          backgroundColor="gray.800"
          borderWidth="1px"
          borderColor="gray.700"
          width="fit-content"
        >
          <Box
            as="button"
            paddingX={4}
            paddingY={2}
            borderRadius="md"
            backgroundColor={!useTemplate ? "blue.500" : "transparent"}
            color={!useTemplate ? "white" : "gray.400"}
            onClick={() => setUseTemplate(false)}
            fontWeight={!useTemplate ? "600" : "500"}
            fontSize="sm"
            transition="all 0.2s"
            _hover={{
              backgroundColor: !useTemplate ? "blue.500" : "gray.750",
              color: !useTemplate ? "white" : "gray.300",
            }}
          >
            Manual Setup
          </Box>
          <Box
            as="button"
            paddingX={4}
            paddingY={2}
            borderRadius="md"
            backgroundColor={useTemplate ? "blue.500" : "transparent"}
            color={useTemplate ? "white" : "gray.400"}
            onClick={() => setUseTemplate(true)}
            fontWeight={useTemplate ? "600" : "500"}
            fontSize="sm"
            transition="all 0.2s"
            _hover={{
              backgroundColor: useTemplate ? "blue.500" : "gray.750",
              color: useTemplate ? "white" : "gray.300",
            }}
          >
            Use Template
          </Box>
        </Box>
      </Box>

      <VStack alignItems="flex-start" gap={2}>
        <Text color="gray.300" fontSize="sm" fontWeight="500">
          Watcher Label
        </Text>
        <Input
          value={watcherLabel}
          onChange={(e) => setWatcherLabel(e.target.value)}
          placeholder="e.g., USDT Whale Tracker"
          backgroundColor="gray.800"
          borderColor="gray.700"
          color="white"
          width="100%"
        />
        <Text color="gray.400" fontSize="xs">
          A friendly name to identify this watcher in notifications
        </Text>
      </VStack>

      {useTemplate ? (
        <VStack alignItems="stretch" gap={4}>
          {READY_EVENTS.map((template, index) => {
            const isSelected = selectedTemplateIndex === index;
            return (
              <Box
                key={index}
                as="button"
                padding={6}
                borderRadius="xl"
                backgroundColor="gray.800"
                borderWidth="2px"
                borderColor={isSelected ? "blue.500" : "gray.700"}
                textAlign="left"
                onClick={() => handleTemplateSelect(index)}
                transition="all 0.2s"
                _hover={{
                  borderColor: isSelected ? "blue.500" : "gray.600",
                }}
              >
                <HStack justifyContent="space-between" alignItems="flex-start">
                  <VStack alignItems="flex-start" gap={2} flex={1}>
                    <Heading as="h3" size="md" color="white">
                      {template.protocol} - {template.description}
                    </Heading>
                    <Text
                      color="gray.400"
                      fontSize="sm"
                      fontFamily="mono"
                      wordBreak="break-all"
                    >
                      {template.event_abi}
                    </Text>
                  </VStack>
                  <Badge
                    backgroundColor="blue.500"
                    color="white"
                    paddingX={3}
                    paddingY={1}
                    borderRadius="md"
                  >
                    {chains?.find((c: any) => c.chain_id === template.chain_id)
                      ?.name || "Ethereum"}
                  </Badge>
                </HStack>
              </Box>
            );
          })}
        </VStack>
      ) : (
        <VStack alignItems="stretch" gap={4}>
          <HStack alignItems="flex-start" gap={4} width="100%">
            <VStack alignItems="flex-start" gap={2} flex={1}>
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                Chain
              </Text>
              <Select
                value={chainId}
                onChange={(e) => setChainId(e.target.value as Id<"chains">)}
                backgroundColor="gray.800"
                borderColor="gray.700"
                color="white"
                placeholder="Select a chain"
                width="100%"
              >
                {chains?.map((chain: any) => (
                  <option key={chain._id} value={chain._id}>
                    {chain.name}
                  </option>
                ))}
              </Select>
            </VStack>

            <VStack alignItems="flex-start" gap={2} flex={2}>
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                Contract Address
              </Text>
              <HStack width="100%" gap={2}>
                <Input
                  value={contractAddress}
                  onChange={(e) => handleAddressChange(e.target.value)}
                  placeholder="0x..."
                  backgroundColor="gray.800"
                  borderColor={addressError ? "red.500" : "gray.700"}
                  color="white"
                  fontFamily="mono"
                  flex={1}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleFetchAbi}
                  isLoading={isFetchingEvents}
                >
                  Fetch ABI
                </Button>
              </HStack>
              {abiFetched && (
                <HStack gap={2} color="green.400" fontSize="sm">
                  <Text>✓</Text>
                  <Text>ABI fetched successfully</Text>
                </HStack>
              )}
              {addressError && (
                <Text color="red.400" fontSize="sm">
                  {addressError}
                </Text>
              )}
              {eventsFetchError && (
                <Text color="red.400" fontSize="sm">
                  {eventsFetchError}
                </Text>
              )}
            </VStack>
          </HStack>

          {availableEvents.length > 0 && (
            <HStack alignItems="flex-start" gap={4} width="100%">
              <VStack alignItems="flex-start" gap={2} flex={1}>
                <Text color="gray.300" fontSize="sm" fontWeight="500">
                  Event
                </Text>
                <Select
                  value={selectedEventIndex}
                  onChange={(e) => handleEventSelect(e.target.value)}
                  backgroundColor="gray.800"
                  borderColor="gray.700"
                  color="white"
                  placeholder="Select an event"
                  width="100%"
                >
                  {availableEvents.map((event: any, index: number) => (
                    <option key={index} value={index.toString()}>
                      {event.name}
                    </option>
                  ))}
                </Select>
              </VStack>

              {eventAbi && (
                <VStack alignItems="flex-start" gap={2} flex={2}>
                  <Text color="gray.300" fontSize="sm" fontWeight="500">
                    Event ABI
                  </Text>
                  <Box
                    paddingX={3}
                    paddingY={2}
                    borderRadius="md"
                    backgroundColor="gray.800"
                    borderWidth="1px"
                    borderColor="gray.700"
                    width="100%"
                    minHeight="40px"
                    display="flex"
                    alignItems="center"
                  >
                    <Text
                      color="blue.400"
                      fontSize="sm"
                      fontFamily="mono"
                      wordBreak="break-all"
                    >
                      {eventAbi}
                    </Text>
                  </Box>
                </VStack>
              )}
            </HStack>
          )}
        </VStack>
      )}
    </VStack>
  );
}
