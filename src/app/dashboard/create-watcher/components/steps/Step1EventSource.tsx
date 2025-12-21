"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
  Badge,
} from "@chakra-ui/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { READY_EVENTS } from "../../../../data/readyEvents";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { parseAbiItem } from "viem";

function getEventName(abi: string) {
  try {
    const parsed = parseAbiItem(abi) as any;
    if (parsed.type === "event" && parsed.name) {
      return parsed.name;
    }
  } catch (e) {
    // Fallback
  }
  const match = abi.match(/event\s+(\w+)\s*\(/);
  return match ? match[1] : "Unknown Event";
}

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
  } = useCreateWatcher();

  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Tabs */}
      <HStack gap={0} borderBottomWidth="1px" borderBottomColor="gray.700">
        <Box
          as="button"
          paddingX={4}
          paddingY={3}
          backgroundColor={!useTemplate ? "gray.800" : "transparent"}
          color={!useTemplate ? "white" : "gray.400"}
          borderBottomWidth={!useTemplate ? "2px" : "0"}
          borderBottomColor={!useTemplate ? "blue.500" : "transparent"}
          onClick={() => setUseTemplate(false)}
          fontWeight={!useTemplate ? "600" : "normal"}
          transition="all 0.2s"
          _hover={{
            backgroundColor: !useTemplate ? "gray.800" : "gray.850",
            color: !useTemplate ? "white" : "gray.300",
          }}
        >
          Manual Setup
        </Box>
        <Box
          as="button"
          paddingX={4}
          paddingY={3}
          backgroundColor={useTemplate ? "gray.800" : "transparent"}
          color={useTemplate ? "white" : "gray.400"}
          borderBottomWidth={useTemplate ? "2px" : "0"}
          borderBottomColor={useTemplate ? "blue.500" : "transparent"}
          onClick={() => setUseTemplate(true)}
          fontWeight={useTemplate ? "600" : "normal"}
          transition="all 0.2s"
          _hover={{
            backgroundColor: useTemplate ? "gray.800" : "gray.850",
            color: useTemplate ? "white" : "gray.300",
          }}
        >
          Use Template
        </Box>
      </HStack>

      {useTemplate ? (
        <VStack alignItems="stretch" gap={4}>
          {READY_EVENTS.map((template, index) => {
            const eventName = getEventName(template.event_abi);
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
          {/* Chain */}
          <VStack alignItems="flex-start" gap={2}>
            <Text color="gray.300" fontSize="sm" fontWeight="500">
              Chain
            </Text>
            <NativeSelectRoot width="100%">
              <NativeSelectField
                value={chainId}
                onChange={(e) => setChainId(e.target.value as Id<"chains">)}
                backgroundColor="gray.800"
                borderColor="gray.700"
                color="white"
                placeholder="Select a chain"
              >
                <option value="">Select a chain</option>
                {chains?.map((chain: any) => (
                  <option key={chain._id} value={chain._id}>
                    {chain.name}
                  </option>
                ))}
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
          </VStack>

          {/* Contract Address */}
          <VStack alignItems="flex-start" gap={2}>
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
                loading={isFetchingEvents}
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

          {/* Event */}
          {availableEvents.length > 0 && (
            <VStack alignItems="flex-start" gap={2}>
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                Event
              </Text>
              <NativeSelectRoot width="100%">
                <NativeSelectField
                  value={selectedEventIndex}
                  onChange={(e) => handleEventSelect(e.target.value)}
                  backgroundColor="gray.800"
                  borderColor="gray.700"
                  color="white"
                  placeholder="Select an event"
                >
                  <option value="">Select an event</option>
                  {availableEvents.map((event: any, index: number) => (
                    <option key={index} value={index.toString()}>
                      {event.name}
                    </option>
                  ))}
                </NativeSelectField>
                <NativeSelectIndicator />
              </NativeSelectRoot>

              {/* Event ABI - Show immediately under Event */}
              {eventAbi && (
                <VStack alignItems="flex-start" gap={2} marginTop={2}>
                  <Text color="gray.300" fontSize="sm" fontWeight="500">
                    Event ABI
                  </Text>
                  <Box
                    padding={4}
                    borderRadius="lg"
                    backgroundColor="gray.800"
                    borderWidth="1px"
                    borderColor="gray.700"
                    width="100%"
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
            </VStack>
          )}
        </VStack>
      )}
    </VStack>
  );
}
