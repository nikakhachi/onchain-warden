"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  Select,
} from "@chakra-ui/react";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { Preview } from "../Preview";

export function Step2Conditions() {
  const {
    conditions,
    addCondition,
    removeCondition,
    updateCondition,
    eventArgs,
    useTemplate,
    selectedTemplate,
    contractAddress,
    handleAddressChange,
    addressError,
  } = useCreateWatcher();

  // Check if contract_address is required (when template.contract_address is undefined)
  const requiresContractAddress =
    useTemplate && selectedTemplate?.contract_address === undefined;

  const getOperators = (argType: string) => {
    if (argType?.includes("uint") || argType?.includes("int")) {
      return ["==", "!=", ">", ">=", "<", "<="];
    }
    return ["==", "!="];
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      <Preview />

      <VStack alignItems="flex-start" gap={3}>
        <Heading as="h3" size="md" color="white">
          Conditional Filters
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Add conditions to filter events. Only events matching ALL conditions
          will trigger notifications.
        </Text>
      </VStack>

      {requiresContractAddress && (
        <VStack alignItems="flex-start" gap={2} width="100%">
          <Text color="gray.300" fontSize="sm" fontWeight="500">
            Contract Address{" "}
            <Text as="span" color="red.400">
              *
            </Text>
          </Text>
          <Input
            value={contractAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="0x..."
            backgroundColor="gray.800"
            borderColor={addressError ? "red.500" : "gray.700"}
            color="white"
            fontFamily="mono"
            width="100%"
          />
          {addressError && (
            <Text color="red.400" fontSize="sm">
              {addressError}
            </Text>
          )}
        </VStack>
      )}

      <VStack alignItems="stretch" gap={4}>
        {conditions.map((condition: any, index: number) => (
          <HStack key={index} gap={3} alignItems="flex-start">
            <Select
              flex={1}
              value={condition.field}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                updateCondition(index, "field", e.target.value)
              }
              backgroundColor="gray.800"
              borderColor="gray.700"
              color="white"
              placeholder="Select argument"
            >
              {eventArgs.map((arg: any, argIndex: number) => (
                <option key={argIndex} value={arg.name || argIndex.toString()}>
                  {arg.name ? `${arg.name} (${arg.type})` : `arg${argIndex}`}
                </option>
              ))}
            </Select>

            <Select
              flex={1}
              value={condition.operator}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
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
            </Select>

            <Input
              flex={1}
              value={condition.value}
              onChange={(e) => updateCondition(index, "value", e.target.value)}
              placeholder="Enter value..."
              backgroundColor="gray.800"
              borderColor={
                condition.required && !condition.value.trim()
                  ? "red.500"
                  : "gray.700"
              }
              color="white"
            />

            {!condition.required && (
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
            )}
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
