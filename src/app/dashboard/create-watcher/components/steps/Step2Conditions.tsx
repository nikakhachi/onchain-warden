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
  Flex,
} from "@chakra-ui/react";
import { parseAbiItem } from "viem";
import { Button } from "../../../../components/Button";
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
      <Box
        padding={4}
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Flex gap={20}>
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
        </Flex>
      </Box>

      <VStack alignItems="flex-start" gap={3}>
        <Heading as="h3" size="md" color="white">
          Conditional Filters
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Add conditions to filter events. Only events matching ALL conditions
          will trigger notifications.
        </Text>
      </VStack>

      <VStack alignItems="stretch" gap={4}>
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
                {eventArgs.map((arg: any, argIndex: number) => (
                  <option
                    key={argIndex}
                    value={arg.name || argIndex.toString()}
                  >
                    {arg.name ? `${arg.name} (${arg.type})` : `arg${argIndex}`}
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
                      "==": "Equals",
                      "!=": "Not Equals",
                      ">": "Greater Than",
                      ">=": "Greater Than or Equal",
                      "<": "Less Than",
                      "<=": "Less Than or Equal",
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
