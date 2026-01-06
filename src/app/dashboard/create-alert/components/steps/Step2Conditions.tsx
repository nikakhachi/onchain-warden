"use client";

import { Box, Input, Heading, Text, HStack, VStack, Select, FormControl, FormLabel } from "@chakra-ui/react";
import { isAddress, parseAbiItem } from "viem";
import { useMemo, useEffect, useState, useRef } from "react";
import { Button } from "../../../../components/Button";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { Preview } from "../Preview";
import { fetchContractEvents, getOperators, getConditionError, getOperatorLabel } from "@/app/helpers";
import { CloseIcon } from "@chakra-ui/icons";

export function Step2Conditions() {
  const {
    conditions,
    eventArgs,
    useTemplate,
    selectedTemplate,
    contractAddress,
    handleAddressChange,
    setConditions,
    eventAbi,
    selectedChain,
    setIsContractAddressVerified,
  } = useCreateWatcher();

  const [isVerifying, setIsVerifying] = useState(false);
  const [eventVerificationError, setEventVerificationError] = useState<string | null>(null);

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "==", value: "", required: false }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: "field" | "operator" | "value", value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  // Check if contract_address is required (when template.contract_address is undefined)
  const requiresContractAddress = useTemplate && selectedTemplate?.contract_address === undefined;

  // Address validation (same as Step 1)
  const isAddressInvalid = useMemo(() => {
    return contractAddress.trim() !== "" && !isAddress(contractAddress);
  }, [contractAddress]);

  // Verify event exists in contract when template requires contract address
  useEffect(() => {
    const verifyEvent = async () => {
      if (!requiresContractAddress || !isAddress(contractAddress) || !selectedChain || !eventAbi) {
        setEventVerificationError(null);
        setIsContractAddressVerified(false);
        return;
      }

      setIsVerifying(true);
      setEventVerificationError(null);
      setIsContractAddressVerified(false);

      try {
        const events = await fetchContractEvents({
          contractAddress,
          chainId: selectedChain.chain_id,
        });

        // Parse template event ABI to get event name and signature
        const templateEvent = parseAbiItem(eventAbi);
        if (templateEvent.type !== "event") throw new Error("Invalid event ABI");

        const templateEventName = templateEvent.name;
        const templateInputTypes = templateEvent.inputs.map((i: any) => i.type);

        // Check if any fetched event matches the template event
        const eventExists = events.some((event: any) => {
          if (event.name !== templateEventName) return false;
          const fetchedInputTypes = event.inputs?.map((i: any) => i.type) || [];
          return (
            fetchedInputTypes.length === templateInputTypes.length &&
            fetchedInputTypes.every((type: string, idx: number) => type === templateInputTypes[idx])
          );
        });

        if (!eventExists) {
          setEventVerificationError("The selected template can't be used with this contract address");
          setIsContractAddressVerified(false);
        } else {
          setEventVerificationError(null);
          setIsContractAddressVerified(true);
        }
      } catch (error) {
        setEventVerificationError("Failed to verify event. Please check the contract address.");
        setIsContractAddressVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };

    const timeoutId = setTimeout(verifyEvent, 500);
    return () => clearTimeout(timeoutId);
  }, [contractAddress, selectedChain, eventAbi, requiresContractAddress]);

  return (
    <VStack alignItems="stretch" gap={6}>
      <Preview />

      <VStack alignItems="flex-start" gap={3}>
        <Heading as="h3" size="md" color="white">
          Conditional Filters
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Add conditions to filter events. Only events matching ALL conditions will trigger notifications.
        </Text>
      </VStack>

      {requiresContractAddress && (
        <FormControl isRequired isInvalid={isAddressInvalid || !!eventVerificationError}>
          <FormLabel color="gray.300">Contract Address</FormLabel>
          <Input
            value={contractAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="0x..."
            backgroundColor="gray.800"
            borderColor={isAddressInvalid || eventVerificationError ? "red.500" : "gray.700"}
            color="white"
            fontFamily="mono"
          />
          {isVerifying && (
            <Text color="yellow.400" fontSize="sm" marginTop={1}>
              ⏳ Verifying event...
            </Text>
          )}
          {isAddressInvalid && (
            <Text color="red.400" fontSize="sm" marginTop={1}>
              Invalid EVM address format
            </Text>
          )}
          {eventVerificationError && !isAddressInvalid && (
            <Text color="red.400" fontSize="sm" marginTop={1}>
              {eventVerificationError}
            </Text>
          )}
        </FormControl>
      )}

      <VStack alignItems="stretch" gap={4}>
        {conditions.map((condition: any, index: number) => (
          <HStack key={index} gap={3} alignItems="flex-start">
            <FormControl isRequired={condition.required} flex={1} marginBottom={0}>
              <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
                Argument
              </FormLabel>
              <Select
                value={condition.field}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateCondition(index, "field", e.target.value)}
                backgroundColor={condition.required ? "gray.900" : "gray.800"}
                borderColor="gray.700"
                color={condition.required ? "gray.500" : "white"}
                placeholder="Select argument"
                disabled={condition.required}
                cursor={condition.required ? "not-allowed" : "pointer"}
              >
                {eventArgs.map((arg: any, argIndex: number) => (
                  <option key={argIndex} value={arg.name || argIndex.toString()}>
                    {arg.name ? `${arg.name} (${arg.type})` : `arg${argIndex}`}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl flex={1} marginBottom={0}>
              <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
                Operator
              </FormLabel>
              <Select
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
                    eventArgs.find((a: any) => a.name === condition.field || a.internalType === condition.field)
                      ?.type || "",
                  ).map((op) => (
                    <option key={op} value={op}>
                      {getOperatorLabel(op)}
                    </option>
                  ))}
              </Select>
            </FormControl>

            <FormControl
              isRequired={condition.required}
              isInvalid={(condition.required && !condition.value.trim()) || !!getConditionError(condition, eventArgs)}
              flex={1}
              marginBottom={0}
            >
              <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
                Value
              </FormLabel>
              <Input
                value={condition.value}
                onChange={(e) => updateCondition(index, "value", e.target.value)}
                placeholder="Enter value..."
                backgroundColor="gray.800"
                borderColor={
                  (condition.required && !condition.value.trim()) || getConditionError(condition, eventArgs)
                    ? "red.500"
                    : "gray.700"
                }
                color="white"
              />
              {getConditionError(condition, eventArgs) && (
                <Text color="red.400" fontSize="sm" marginTop={1}>
                  {getConditionError(condition, eventArgs)}
                </Text>
              )}
            </FormControl>

            {!condition.required && (
              <Box as="button" onClick={() => removeCondition(index)} padding={2} marginTop={7}>
                <CloseIcon fontSize="xs" color="gray.400" />
              </Box>
            )}
          </HStack>
        ))}

        <Button variant="secondary" size="sm" onClick={addCondition} alignSelf="flex-start">
          + Add Another Condition
        </Button>
      </VStack>
    </VStack>
  );
}
