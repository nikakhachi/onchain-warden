"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  Select,
  SimpleGrid,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { READY_EVENTS } from "../../../../data/readyEvents";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { useState, useMemo } from "react";
import { ChainIcon } from "../../../../icons/ChainIcon";
import { ProtocolIcon } from "@/app/icons/ProtocolIcon";

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
    selectedTemplate,
  } = useCreateWatcher();

  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  // Group templates by protocol
  const templatesByProtocol = useMemo(() => {
    const grouped: Record<string, typeof READY_EVENTS> = {};
    READY_EVENTS.forEach((template) => {
      if (!grouped[template.protocol]) {
        grouped[template.protocol] = [];
      }
      grouped[template.protocol].push(template);
    });
    return grouped;
  }, []);

  // Get unique protocols
  const protocols = useMemo(() => {
    return Object.keys(templatesByProtocol).sort();
  }, [templatesByProtocol]);

  // Get templates for selected protocol
  const selectedProtocolTemplates = useMemo(() => {
    if (!selectedProtocol) return [];
    return templatesByProtocol[selectedProtocol] || [];
  }, [selectedProtocol, templatesByProtocol]);

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
              backgroundColor: !useTemplate ? "blue.500" : "gray.700",
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
              backgroundColor: useTemplate ? "blue.500" : "gray.700",
              color: useTemplate ? "white" : "gray.300",
            }}
          >
            Use Template
          </Box>
        </Box>
      </Box>

      <VStack alignItems="flex-start" gap={2}>
        <Text color="gray.300" fontSize="sm" fontWeight="500">
          Alert Label
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
          A friendly name to identify this alert in notifications
        </Text>
      </VStack>

      {useTemplate ? (
        selectedProtocol ? (
          // Template list view for selected protocol
          <VStack alignItems="stretch" gap={3}>
            <HStack alignItems="center" gap={2}>
              <Box
                as="button"
                onClick={() => setSelectedProtocol(null)}
                padding={1.5}
                borderRadius="md"
                _hover={{ backgroundColor: "gray.700" }}
              >
                <Text color="white" fontSize="xs">
                  ← Back
                </Text>
              </Box>
              <HStack gap={1.5}>
                <Box width="20px" height="20px" flexShrink={0}>
                  <ProtocolIcon name={selectedProtocol} />
                </Box>
                <Heading as="h2" size="sm" color="white" fontSize="sm">
                  {selectedProtocol}
                </Heading>
              </HStack>
            </HStack>

            <VStack alignItems="stretch" gap={2}>
              {selectedProtocolTemplates.map((template) => {
                const originalIndex = READY_EVENTS.findIndex(
                  (t) => t === template
                );
                const isSelected = selectedTemplateIndex === originalIndex;
                const chainName =
                  chains?.find((c: any) => c.chain_id === template.chain_id)
                    ?.name || "Ethereum";

                return (
                  <Box
                    key={originalIndex}
                    as="button"
                    padding={3}
                    borderRadius="md"
                    backgroundColor="gray.800"
                    borderWidth="1px"
                    borderColor={isSelected ? "blue.500" : "gray.700"}
                    textAlign="left"
                    onClick={() => handleTemplateSelect(originalIndex)}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: isSelected ? "blue.500" : "gray.600",
                    }}
                    width="100%"
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <VStack alignItems="flex-start" gap={0.5} flex={1}>
                        <Heading as="h3" size="sm" color="white" fontSize="sm">
                          {template.description}
                        </Heading>
                        <HStack gap={1.5}>
                          <Box
                            width="6px"
                            height="6px"
                            borderRadius="full"
                            backgroundColor="blue.500"
                          />
                          <Text color="gray.400" fontSize="xs">
                            {chainName}
                          </Text>
                        </HStack>
                      </VStack>
                      <Text color="blue.400" fontSize="xs" fontFamily="mono">
                        {template.event_abi}
                      </Text>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </VStack>
        ) : (
          // Protocol cards view
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={3}>
            {protocols.map((protocol) => {
              const templateCount = templatesByProtocol[protocol].length;

              return (
                <Box
                  key={protocol}
                  as="button"
                  padding={4}
                  borderRadius="lg"
                  backgroundColor="gray.800"
                  borderWidth="1px"
                  borderColor="gray.700"
                  textAlign="left"
                  onClick={() => setSelectedProtocol(protocol)}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: "gray.600",
                    backgroundColor: "gray.700",
                  }}
                  width="100%"
                >
                  <VStack alignItems="flex-start" gap={4} width="100%">
                    <HStack gap={2} alignItems="flex-end">
                      <Box width="24px" height="24px" flexShrink={0}>
                        <ProtocolIcon name={protocol} />
                      </Box>
                      <Heading as="h3" color="white" fontSize="lg">
                        {protocol}
                      </Heading>
                    </HStack>

                    <HStack justifyContent="space-between" width="100%">
                      <Text color="gray.400" fontSize="xs">
                        {templateCount} template{templateCount !== 1 ? "s" : ""}{" "}
                        →
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              );
            })}
          </SimpleGrid>
        )
      ) : (
        <VStack alignItems="stretch" gap={4}>
          <HStack alignItems="flex-start" gap={4} width="100%">
            <VStack alignItems="flex-start" gap={2} flex={1}>
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                Chain
              </Text>
              <RadioGroup
                value={chainId}
                onChange={(value) => setChainId(value as Id<"chains">)}
                width="100%"
              >
                <SimpleGrid columns={3} gap={1.5} width="100%">
                  {chains?.map((chain: any) => {
                    const isSelected = chainId === chain._id;
                    return (
                      <Box
                        key={chain._id}
                        as="label"
                        padding={2.5}
                        paddingX={3}
                        borderRadius="lg"
                        backgroundColor="gray.800"
                        borderWidth="1.5px"
                        borderColor={isSelected ? "blue.500" : "gray.700"}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          borderColor: isSelected ? "blue.500" : "gray.600",
                          backgroundColor: isSelected ? "gray.800" : "gray.700",
                        }}
                        width="100%"
                      >
                        <HStack gap={2.5}>
                          <Radio
                            value={chain._id}
                            colorScheme="blue"
                            size="sm"
                          />
                          <Box
                            width="24px"
                            height="24px"
                            borderRadius="full"
                            overflow="hidden"
                            flexShrink={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <ChainIcon name={chain.name} />
                          </Box>
                          <Text color="white" fontWeight="500" fontSize="xs">
                            {chain.name}
                          </Text>
                        </HStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </RadioGroup>
            </VStack>

            <VStack alignItems="flex-start" gap={2} flex={1}>
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

              {availableEvents.length > 0 && (
                <VStack alignItems="flex-start" gap={2} width="100%">
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
              )}

              {eventAbi && (
                <VStack alignItems="flex-start" gap={2} width="100%">
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
            </VStack>
          </HStack>
        </VStack>
      )}
    </VStack>
  );
}
