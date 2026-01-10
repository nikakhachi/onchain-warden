"use client";

import { Input, HStack, Select, FormControl, FormLabel, FormErrorMessage, Box, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { Condition, EventArg } from "@/app/shared/types";
import { getOperators, getOperatorLabel, getConditionError } from "@/app/shared/helpers";
import { validateFormula } from "../../../../../convex/helpers/formulaUtils";
import { ConditionFormulaInformation } from "../ConditionFormulaInformation";

/**
 * Validates a formula that may contain comparison operators (>, <, >=, <=, ==, !=)
 */
function validateFormulaWithOperator(formula: string): { isValid: boolean; error?: string } {
  if (!formula || formula.trim() === "") {
    return { isValid: true };
  }

  // Check if formula contains at least one comparison operator
  const hasOperator = /[><=!]+/.test(formula);
  if (!hasOperator) {
    return { isValid: false, error: "Formula must include a comparison operator (>, <, >=, <=, ==, !=)" };
  }

  // Use the updated validateFormula which now supports comparison operators
  return validateFormula(formula);
}

interface ConditionRowProps {
  condition: Condition;
  index: number;
  eventArgs: EventArg[];
  onUpdate: (index: number, field: "field" | "operator" | "value" | "type" | "formula", value: string) => void;
  onRemove: (index: number) => void;
  onFieldChange: (index: number, newField: string) => void;
}

export function ConditionRow({ condition, index, eventArgs, onUpdate, onRemove, onFieldChange }: ConditionRowProps) {
  const selectedArg = eventArgs.find((a: any) => a.name === condition.field || a.internalType === condition.field);
  const isCustomFormula = condition.operator === "custom_formula";

  // Formula validation for custom formula (includes operators)
  const formulaValidation = useMemo(() => {
    if (!isCustomFormula || !condition.value || condition.value.trim() === "") {
      return { isValid: true };
    }
    // Validate formula that may contain comparison operators
    return validateFormulaWithOperator(condition.value);
  }, [isCustomFormula, condition.value]);

  // Standard value validation (only for non-custom-formula types)
  const standardValueError = useMemo(() => {
    if (isCustomFormula || !condition.field || !condition.value.trim()) {
      return undefined;
    }
    return getConditionError(condition, eventArgs);
  }, [isCustomFormula, condition.field, condition.value, condition, eventArgs]);

  const hasError = isCustomFormula
    ? !formulaValidation.isValid
    : (condition.required && !condition.value.trim()) || !!standardValueError;

  return (
    <HStack gap={3} alignItems="flex-start">
      <FormControl isRequired={condition.required} flex={1} marginBottom={0} maxW="280px">
        <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
          Argument
        </FormLabel>
        <Select
          value={condition.field}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            onFieldChange(index, e.target.value);
          }}
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

      <FormControl flex={1} marginBottom={0} maxW="250px">
        <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
          Operator
        </FormLabel>
        <Select
          value={condition.operator}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUpdate(index, "operator", e.target.value)}
          backgroundColor="gray.800"
          borderColor="gray.700"
          color="white"
        >
          {condition.field &&
            getOperators(selectedArg?.type || "").map((op) => (
              <option key={op} value={op}>
                {getOperatorLabel(op)}
              </option>
            ))}
        </Select>
      </FormControl>

      <FormControl isInvalid={hasError} flex={1} marginBottom={0}>
        <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
          <HStack gap={2} alignItems="center">
            <Text>{isCustomFormula ? "Custom Formula" : "Value"}</Text>
            {isCustomFormula && <ConditionFormulaInformation />}
          </HStack>
        </FormLabel>
        {isCustomFormula ? (
          <>
            <Input
              value={condition.value || ""}
              onChange={(e) => onUpdate(index, "value", e.target.value)}
              placeholder="e.g., (pow(1 + value, 365) - 1) * 100 >= 10"
              backgroundColor="gray.800"
              borderColor={formulaValidation.isValid ? "gray.700" : "red.500"}
              color="white"
            />
            {!formulaValidation.isValid && formulaValidation.error && (
              <FormErrorMessage fontSize="xs" marginTop={1}>
                {formulaValidation.error}
              </FormErrorMessage>
            )}
          </>
        ) : (
          <>
            <Input
              value={condition.value}
              onChange={(e) => onUpdate(index, "value", e.target.value)}
              placeholder="Enter value..."
              backgroundColor="gray.800"
              borderColor={hasError ? "red.500" : "gray.700"}
              color="white"
            />
            {standardValueError && (
              <Text color="red.400" fontSize="sm" marginTop={1}>
                {standardValueError}
              </Text>
            )}
          </>
        )}
      </FormControl>

      {!condition.required && (
        <Box as="button" onClick={() => onRemove(index)} padding={2} marginTop={7} color="gray.400">
          <IoMdCloseCircleOutline size={22} />
        </Box>
      )}
    </HStack>
  );
}
