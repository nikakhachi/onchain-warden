"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  VStack,
  FormControl,
  FormLabel,
  TabPanel,
  Tooltip,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { isAddress, parseAbiItem } from "viem";
import { useMemo, useEffect, useState } from "react";
import { FaCircleInfo } from "react-icons/fa6";
import { Button } from "@/app/components/Button";
import { fetchContractEvents } from "@/app/shared/helpers";
import { Condition, EventArg } from "@/app/shared/types";
import { ConditionRow } from "./ConditionRow";

interface ConditionsProps {
  conditions: Condition[];
  setConditions: (conditions: Condition[] | ((prev: Condition[]) => Condition[])) => void;
  eventArgs: EventArg[];
  argFormulas?: Record<string, string>;
  // Optional props for create alert flow
  showPreview?: boolean;
  previewComponent?: React.ReactNode;
  requiresContractAddress?: boolean;
  requiresContractAddressDescription?: string;
  contractAddress?: string;
  handleAddressChange?: (value: string) => void;
  eventAbi?: string;
  chainId?: number;
  setIsContractAddressVerified?: (verified: boolean) => void;
  // Wrapper props
  wrapper?: "div" | "TabPanel";
  wrapperProps?: any;
}

export function Conditions({
  conditions,
  setConditions,
  eventArgs,
  argFormulas,
  showPreview = false,
  previewComponent,
  requiresContractAddress = false,
  requiresContractAddressDescription = "",
  contractAddress = "",
  handleAddressChange,
  eventAbi,
  chainId,
  setIsContractAddressVerified,
  wrapper = "div",
  wrapperProps = {},
}: ConditionsProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [eventVerificationError, setEventVerificationError] = useState<string | null>(null);

  const addCondition = () => {
    setConditions([...conditions, { field: "", operator: "==", value: "", required: false }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: "field" | "operator" | "value" | "type" | "formula",
    value: string,
  ) => {
    const updated = [...conditions];
    if (field === "operator" && value === "custom_formula") {
      const formulaForField = argFormulas?.[updated[index].field];
      updated[index] = {
        ...updated[index],
        operator: "custom_formula",
        value: formulaForField ? formulaForField + " " : "",
      };
    } else if (field === "operator" && updated[index].operator === "custom_formula") {
      updated[index] = { ...updated[index], operator: value, value: "" };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setConditions(updated);
  };

  const handleFieldChange = (index: number, newField: string) => {
    const newArg = eventArgs.find((a: any) => a.name === newField || a.internalType === newField);
    const isNewArgUintOrInt = newArg?.type?.includes("uint") || newArg?.type?.includes("int");
    const formulaForField = argFormulas?.[newField];

    const updated = [...conditions];
    const currentOperator = updated[index].operator;

    let newOperator: string;
    let newValue = "";

    if (formulaForField && isNewArgUintOrInt) {
      newOperator = "custom_formula";
      newValue = formulaForField + " ";
    } else if (!isNewArgUintOrInt) {
      newOperator = currentOperator === "custom_formula" ? "==" : currentOperator;
    } else {
      newOperator = currentOperator;
    }

    updated[index] = {
      ...updated[index],
      field: newField,
      operator: newOperator,
      value: newValue,
    };
    setConditions(updated);
  };

  // Address validation
  const isAddressInvalid = useMemo(() => {
    return contractAddress.trim() !== "" && !isAddress(contractAddress);
  }, [contractAddress]);

  // Verify event exists in contract when template requires contract address
  useEffect(() => {
    const verifyEvent = async () => {
      if (
        !requiresContractAddress ||
        !isAddress(contractAddress) ||
        !chainId ||
        !eventAbi ||
        !setIsContractAddressVerified
      ) {
        setEventVerificationError(null);
        if (setIsContractAddressVerified) setIsContractAddressVerified(false);
        return;
      }

      setIsVerifying(true);
      setEventVerificationError(null);
      setIsContractAddressVerified(false);

      try {
        const events = await fetchContractEvents({
          contractAddress,
          chainId: Number(chainId),
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
  }, [contractAddress, chainId, eventAbi, requiresContractAddress, setIsContractAddressVerified]);

  const content = (
    <VStack alignItems="stretch" gap={6}>
      {showPreview && previewComponent}

      <VStack alignItems="flex-start" gap={3}>
        <HStack gap={2} alignItems="center">
          <Heading as="h3" size="md" color="white">
            Conditional Filters
          </Heading>
          <Tooltip
            label={
              <VStack alignItems="flex-start" gap={2} fontSize="xs">
                <Text>Without conditions, every event triggers an alert.</Text>
                <Text>
                  Add conditions to only get notified when specific criteria are met (e.g., amount &gt; 10000).
                </Text>
                <Text>Use '% Difference' to alert on changes compared to the previous event.</Text>
                <Text>Use 'Custom Formula' for advanced calculations like APY conversions.</Text>
              </VStack>
            }
            backgroundColor="gray.800"
            color="white"
            padding={3}
            borderRadius="md"
            borderWidth="1px"
            borderColor="gray.700"
            maxW="360px"
            hasArrow
          >
            <Icon as={FaCircleInfo} color="gray.400" _hover={{ color: "gray.300" }} cursor="help" />
          </Tooltip>
        </HStack>
        <Text color="gray.400" fontSize="sm">
          Optional rules to filter which events trigger alerts.
        </Text>
      </VStack>

      {requiresContractAddress && (
        <FormControl isRequired isInvalid={isAddressInvalid || !!eventVerificationError}>
          <FormLabel color="gray.300" display="flex" alignItems="center" gap={2} requiredIndicator={<></>}>
            {requiresContractAddressDescription} Address
            <Text as="span" color="gray.500" fontSize="xs" fontWeight="normal">
              {requiresContractAddressDescription?.toLowerCase() || "contract"} to monitor
            </Text>
            <Text as="span" color="red.400">
              *
            </Text>
          </FormLabel>
          <Input
            value={contractAddress}
            onChange={(e) => handleAddressChange?.(e.target.value)}
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
        {conditions.length === 0 ? (
          <Box
            padding={6}
            textAlign="center"
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text color="gray.400" fontSize="sm">
              No conditions set — you'll receive alerts for every event
            </Text>
            <Text color="gray.500" fontSize="xs" marginTop={1}>
              Click "Add Another Condition" to filter specific events
            </Text>
          </Box>
        ) : (
          conditions.map((condition: any, index: number) => (
            <ConditionRow
              key={index}
              condition={condition}
              index={index}
              eventArgs={eventArgs}
              argFormulas={argFormulas}
              onUpdate={updateCondition}
              onRemove={removeCondition}
              onFieldChange={handleFieldChange}
            />
          ))
        )}

        <Button variant="secondary" size="sm" onClick={addCondition} alignSelf="flex-start">
          + Add Another Condition
        </Button>
      </VStack>
    </VStack>
  );

  if (wrapper === "TabPanel") {
    return <TabPanel {...wrapperProps}>{content}</TabPanel>;
  }

  return <div {...wrapperProps}>{content}</div>;
}
