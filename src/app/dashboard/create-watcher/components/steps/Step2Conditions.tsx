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
  SimpleGrid,
} from "@chakra-ui/react";
import { parseAbiItem } from "viem";
import { Button } from "../../Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";

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

export function Step2Conditions() {
  const {
    chainId,
    contractAddress,
    eventAbi,
    selectedChain,
    conditions,
    addCondition,
    removeCondition,
    updateCondition,
    eventArgs,
  } = useCreateWatcher();

  const getOperators = (argType: string) => {
    if (argType?.includes("uint") || argType?.includes("int")) {
      return ["==", "!=", ">", ">=", "<", "<="];
    }
    return ["==", "!="];
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Event Configuration Summary */}
      <Box
        padding={4}
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <SimpleGrid columns={3} gap={4}>
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
              {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
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
        </SimpleGrid>
      </Box>

      {/* Conditional Filters */}
      <VStack alignItems="flex-start" gap={3}>
        <HStack gap={2}>
          <Heading as="h3" size="md" color="white">
            Conditional Filters
          </Heading>
          <Box
            width="20px"
            height="20px"
            borderRadius="full"
            backgroundColor="gray.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            color="gray.400"
          >
            ⓘ
          </Box>
        </HStack>
        <Text color="gray.400" fontSize="sm">
          Add conditions to filter events. Only events matching ALL conditions
          will trigger notifications.
        </Text>
      </VStack>

      {/* Conditions */}
      <VStack alignItems="stretch" gap={4}>
        <HStack justifyContent="space-between">
          <Heading as="h3" size="md" color="white">
            Conditions
          </Heading>
          <Text color="gray.400" fontSize="sm">
            {conditions.length} condition{conditions.length !== 1 ? "s" : ""}
          </Text>
        </HStack>

        {conditions.map((condition: any, index: number) => (
          <HStack key={index} gap={3} alignItems="flex-start">
            <NativeSelectRoot flex={1}>
              <NativeSelectField
                value={condition.field}
                onChange={(e) =>
                  updateCondition(index, "field", e.target.value)
                }
                backgroundColor="gray.800"
                borderColor="gray.700"
                color="white"
                placeholder="Select argument"
              >
                <option value="">Select argument</option>
                {eventArgs.map((arg: any, argIndex: number) => (
                  <option
                    key={argIndex}
                    value={arg.name || argIndex.toString()}
                  >
                    {arg.name || `arg${argIndex}`}
                  </option>
                ))}
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>

            <NativeSelectRoot flex={1}>
              <NativeSelectField
                value={condition.operator}
                onChange={(e) =>
                  updateCondition(index, "operator", e.target.value)
                }
                backgroundColor="gray.800"
                borderColor="gray.700"
                color="white"
              >
                {condition.field &&
                  getOperators(
                    eventArgs.find(
                      (a: any) =>
                        a.name === condition.field ||
                        a.internalType === condition.field
                    )?.type || ""
                  ).map((op) => {
                    const labels: Record<string, string> = {
                      "==": "Equals (==)",
                      "!=": "Not Equals (!=)",
                      ">": "Greater Than (>)",
                      ">=": "Greater Than or Equal (>=)",
                      "<": "Less Than (<)",
                      "<=": "Less Than or Equal (<=)",
                    };
                    return (
                      <option key={op} value={op}>
                        {labels[op] || op}
                      </option>
                    );
                  })}
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>

            <Input
              flex={1}
              value={condition.value}
              onChange={(e) => updateCondition(index, "value", e.target.value)}
              placeholder="Enter value..."
              backgroundColor="gray.800"
              borderColor="gray.700"
              color="white"
            />

            <Box
              as="button"
              onClick={() => removeCondition(index)}
              padding={2}
              borderRadius="md"
              _hover={{ backgroundColor: "gray.700" }}
              color="gray.400"
            >
              🗑️
            </Box>
          </HStack>
        ))}

        <Button
          variant="secondary"
          size="sm"
          onClick={addCondition}
          alignSelf="flex-start"
        >
          + Add Another Condition
        </Button>
      </VStack>
    </VStack>
  );
}
