"use client";

import {
  Input,
  HStack,
  VStack,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  Text,
  Icon,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaCircleInfo } from "react-icons/fa6";
import { IoWarningOutline } from "react-icons/io5";
import { Condition, EventArg } from "@/app/shared/types";
import { getOperators, getOperatorLabel, getConditionError } from "@/app/shared/helpers";
import { validateFormula } from "../../../../../convex/helpers/formulaUtils";
import { ConditionFormulaInformation } from "../ConditionFormulaInformation";
import { PercentageDifferenceInformation } from "../PercentageDifferenceInformation";

function validateFormulaWithOperator(formula: string): { isValid: boolean; error?: string } {
  if (!formula || formula.trim() === "") {
    return { isValid: true };
  }

  const hasOperator = /[><=!]+/.test(formula);
  if (!hasOperator) {
    return { isValid: false, error: "Formula must include a comparison operator (>, <, >=, <=, ==, !=)" };
  }

  return validateFormula(formula);
}

interface ConditionRowProps {
  condition: Condition;
  index: number;
  eventArgs: EventArg[];
  argFormulaConfigs?: Record<string, { formula: string; description: string; exampleValue: string; label: string }>;
  onUpdate: (index: number, field: "field" | "operator" | "value" | "type" | "formula", value: string) => void;
  onRemove: (index: number) => void;
  onFieldChange: (index: number, newField: string) => void;
}

export function ConditionRow({
  condition,
  index,
  eventArgs,
  argFormulaConfigs,
  onUpdate,
  onRemove,
  onFieldChange,
}: ConditionRowProps) {
  const selectedArg = eventArgs.find((a: any) => a.name === condition.field || a.internalType === condition.field);
  const isCustomFormula = condition.operator === "custom_formula";
  const formulaConfig = argFormulaConfigs?.[condition.field];
  const templateFormula = formulaConfig?.formula;
  const formulaDescription = formulaConfig?.description;
  const formulaExampleValue = formulaConfig?.exampleValue || "5";
  const formulaLabel = formulaConfig?.label || condition.field;

  // Detect if the formula value is still in the pre-filled state (formula only, no comparison yet)
  const isFormulaPreFilled = useMemo(() => {
    if (!templateFormula || !isCustomFormula || !condition.value) return false;
    return condition.value.trim() === templateFormula.trim();
  }, [templateFormula, isCustomFormula, condition.value]);

  const formulaValidation = useMemo(() => {
    if (!isCustomFormula || !condition.value || condition.value.trim() === "") {
      return { isValid: true };
    }
    return validateFormulaWithOperator(condition.value);
  }, [isCustomFormula, condition.value]);

  const standardValueError = useMemo(() => {
    if (isCustomFormula || !condition.field || !condition.value.trim()) {
      return undefined;
    }
    return getConditionError(condition, eventArgs);
  }, [isCustomFormula, condition.field, condition.value, condition, eventArgs]);

  // Don't flag pre-filled formula as a hard error (it's incomplete, not wrong)
  const hasError = isCustomFormula
    ? !formulaValidation.isValid && !isFormulaPreFilled
    : (condition.required && !condition.value.trim()) || !!standardValueError;

  return (
    <VStack alignItems="stretch" gap={0}>
      <HStack gap={3} alignItems="flex-start">
        <FormControl isRequired={condition.required} flex={1} marginBottom={0} maxW="280px">
          <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
            Event Field
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
            {eventArgs
              .filter((arg: any) => !arg.isArrayField)
              .map((arg: any, argIndex: number) => (
                <option key={argIndex} value={arg.name || argIndex.toString()}>
                  {arg.name ? `${arg.name} (${arg.type})` : `arg${argIndex}`}
                </option>
              ))}
          </Select>
        </FormControl>

        <FormControl flex={1} marginBottom={0} maxW="250px">
          <FormLabel color="gray.300" fontSize="sm" marginBottom={1.5}>
            Comparison
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
              <Text>
                {isCustomFormula
                  ? "Custom Formula"
                  : condition.operator === "rel"
                    ? "Difference in Percentage"
                    : "Value"}
              </Text>
              {isCustomFormula && <ConditionFormulaInformation />}
              {condition.operator === "rel" && <PercentageDifferenceInformation />}
            </HStack>
          </FormLabel>
          {isCustomFormula ? (
            <>
              <Input
                value={condition.value || ""}
                onChange={(e) => onUpdate(index, "value", e.target.value)}
                placeholder="e.g., (pow(1 + value, 365) - 1) * 100 >= 10"
                backgroundColor="gray.800"
                borderColor={isFormulaPreFilled ? "blue.500" : formulaValidation.isValid ? "gray.700" : "red.500"}
                color="white"
              />
              {isFormulaPreFilled && (
                <Text color="blue.300" fontSize="xs" marginTop={1}>
                  Add a comparison operator and value at the end (e.g., {">="} {formulaExampleValue})
                </Text>
              )}
              {!formulaValidation.isValid && !isFormulaPreFilled && formulaValidation.error && (
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
                placeholder={condition.operator === "rel" ? "e.g., 10 for 10% difference" : "Enter value..."}
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

      {/* Info banner: formula pre-filled from template */}
      {templateFormula && isCustomFormula && (
        <Box
          backgroundColor="rgba(49, 130, 206, 0.08)"
          borderWidth="1px"
          borderColor="blue.900"
          borderRadius="md"
          paddingX={3}
          paddingY={2}
          marginTop={2}
        >
          <HStack gap={2} alignItems="flex-start">
            <Icon as={FaCircleInfo} color="blue.400" marginTop="2px" flexShrink={0} boxSize={3.5} />
            <VStack alignItems="flex-start" gap={0.5}>
              <Text color="blue.300" fontSize="xs" lineHeight="tall">
                This field uses a template formula to convert raw blockchain data.
                {formulaDescription && (
                  <>
                    {" "}
                    Formatted value:{" "}
                    <Text as="span" fontWeight="semibold" color="blue.200">
                      {formulaDescription}
                    </Text>
                    .
                  </>
                )}
              </Text>
              <Text color="blue.400" fontSize="xs" fontFamily="mono" opacity={0.8}>
                Example: {templateFormula.length > 40 ? templateFormula.slice(0, 40) + "..." : templateFormula} {">="}{" "}
                {formulaExampleValue}{" "}
                <Text as="span" fontFamily="body" fontStyle="italic" color="blue.300" opacity={0.9}>
                  (Alerts on events with {formulaLabel} more than {formulaExampleValue})
                </Text>
              </Text>
            </VStack>
          </HStack>
        </Box>
      )}

      {/* Warning: using standard operator on a formula field */}
      {templateFormula && !isCustomFormula && condition.operator !== "rel" && (
        <Box
          backgroundColor="rgba(214, 158, 46, 0.08)"
          borderWidth="1px"
          borderColor="yellow.900"
          borderRadius="md"
          paddingX={3}
          paddingY={2}
          marginTop={2}
        >
          <HStack gap={2} alignItems="flex-start">
            <Icon as={IoWarningOutline} color="yellow.500" marginTop="2px" flexShrink={0} boxSize={3.5} />
            <Text color="yellow.400" fontSize="xs" lineHeight="tall">
              This field&apos;s raw value is not human-readable — the template converts it using a formula.
              {formulaDescription && (
                <>
                  {" "}
                  Converted format:{" "}
                  <Text as="span" fontWeight="semibold" color="yellow.300">
                    {formulaDescription}
                  </Text>
                  .
                </>
              )}{" "}
              Direct comparisons use the raw value and may not work as expected. Consider switching to{" "}
              <Text as="span" fontWeight="semibold" color="yellow.300">
                Custom Formula
              </Text>{" "}
              for accurate filtering.
            </Text>
          </HStack>
        </Box>
      )}

      {/* Note: percentage change on formula field uses raw value */}
      {templateFormula && condition.operator === "rel" && (
        <Box
          backgroundColor="rgba(128, 128, 128, 0.06)"
          borderWidth="1px"
          borderColor="gray.700"
          borderRadius="md"
          paddingX={3}
          paddingY={2}
          marginTop={2}
        >
          <HStack gap={2} alignItems="flex-start">
            <Icon as={FaCircleInfo} color="gray.500" marginTop="2px" flexShrink={0} boxSize={3.5} />
            <Text color="gray.400" fontSize="xs" lineHeight="tall">
              Percentage change is calculated on the raw value before formula conversion. For linear formulas this
              produces equivalent results; for non-linear formulas the percentage may differ.
            </Text>
          </HStack>
        </Box>
      )}
    </VStack>
  );
}
