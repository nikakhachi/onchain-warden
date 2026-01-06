"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  VStack,
  Checkbox,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  FormControl,
  FormErrorMessage,
  Select,
  HStack,
} from "@chakra-ui/react";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { ChangeEvent, useMemo } from "react";
import { Preview } from "../Preview";
import { validateFormula } from "../../../../../../convex/helpers/formulaUtils";
import { FormulaInformation } from "../../../components/FormulaInformation";

const MessageCheckbox = ({
  isChecked,
  onChange,
  label,
}: {
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) => (
  <Checkbox
    isChecked={isChecked}
    onChange={(e) => onChange(e)}
    borderColor="gray.700"
    borderWidth="1px"
    p={2}
    borderRadius="lg"
  >
    <Text color="white" fontSize="sm" marginLeft={2}>
      {label}
    </Text>
  </Checkbox>
);

const ColumnHeader = ({ label }: { label: string }) => (
  <Th padding={3} textAlign="left" color="gray.400" fontSize="xs" fontWeight="600" textTransform="uppercase">
    {label}
  </Th>
);

export function Step3Message() {
  const { displayConfig, setDisplayConfig, eventArgs } = useCreateWatcher();

  const handleCheckboxChange = (field: string, e: ChangeEvent<HTMLInputElement>) => {
    setDisplayConfig({ ...displayConfig, [field]: e.target.checked });
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      <Preview />

      {/* Event Arguments */}
      {eventArgs.length > 0 && (
        <VStack alignItems="flex-start" gap={4}>
          <VStack alignItems="flex-start" gap={2}>
            <Heading as="h3" size="md" color="white">
              Event Arguments
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Configure how event arguments are displayed
            </Text>
          </VStack>

          <Box
            width="100%"
            overflowX="auto"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.700"
            backgroundColor="gray.800"
          >
            <Table variant="unstyled" size="sm" width="100%">
              <Thead backgroundColor="gray.800">
                <Tr borderBottomWidth="1px" borderBottomColor="gray.700">
                  <ColumnHeader label="Show" />
                  <ColumnHeader label="Argument" />
                  <ColumnHeader label="Type" />
                  <ColumnHeader label="Custom Label" />
                  <ColumnHeader label="Format Type" />
                  <Th
                    padding={3}
                    textAlign="left"
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                  >
                    <HStack gap={2} alignItems="center">
                      <Text>Decimals / Formula</Text>
                      <FormulaInformation />
                    </HStack>
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {eventArgs.map((arg: any, index: number) => {
                  const argKey = arg.name || `argument${index}`;
                  const argConfig = displayConfig.args.find(
                    (a: { key: string; label?: string; decimals?: number; formula?: string }) => a.key === argKey,
                  );
                  const isChecked = argConfig !== undefined;
                  const isUint = arg.type?.includes("uint");

                  const handleToggle = (checked: boolean) => {
                    if (checked) {
                      const updated = [...displayConfig.args];
                      updated.push({
                        key: argKey,
                        label: argKey,
                        decimals: undefined, // Start empty, will be treated as 0 in backend
                      });
                      setDisplayConfig({ ...displayConfig, args: updated });
                    } else {
                      const updated = displayConfig.args.filter((a: { key: string }) => a.key !== argKey);
                      setDisplayConfig({ ...displayConfig, args: updated });
                    }
                  };

                  const handleLabelChange = (value: string) => {
                    const updated = displayConfig.args.map((a: any) => (a.key === argKey ? { ...a, label: value } : a));
                    setDisplayConfig({ ...displayConfig, args: updated });
                  };

                  const handleDecimalsChange = (value: number | undefined) => {
                    const updated = displayConfig.args.map((a: any) =>
                      a.key === argKey ? { ...a, decimals: value, formula: undefined } : a,
                    );
                    setDisplayConfig({ ...displayConfig, args: updated });
                  };

                  const handleFormulaChange = (value: string) => {
                    const updated = displayConfig.args.map((a: any) =>
                      a.key === argKey ? { ...a, formula: value || "", decimals: undefined } : a,
                    );
                    setDisplayConfig({ ...displayConfig, args: updated });
                  };

                  const handleFormatTypeChange = (formatType: string) => {
                    const updated = displayConfig.args.map((a: any) => {
                      if (a.key === argKey) {
                        if (formatType === "decimals") {
                          // Switching to decimals: clear formula, keep decimals (or set to undefined)
                          return { ...a, formula: undefined };
                        } else if (formatType === "formula") {
                          // Switching to formula: clear decimals, keep formula (or set to empty string if none exists)
                          return { ...a, decimals: undefined, formula: a.formula || "" };
                        }
                      }
                      return a;
                    });
                    setDisplayConfig({ ...displayConfig, args: updated });
                  };

                  // Determine current format type: if formula exists (even if empty string), use formula; otherwise use decimals
                  const currentFormatType =
                    argConfig?.formula !== undefined && argConfig.formula !== null ? "formula" : "decimals";

                  // Validate formula in real-time
                  const formulaValidation = useMemo(() => {
                    if (!argConfig?.formula || argConfig.formula.trim() === "") {
                      return { isValid: true };
                    }
                    return validateFormula(argConfig.formula);
                  }, [argConfig?.formula]);

                  return (
                    <Tr
                      key={index}
                      borderBottomWidth="1px"
                      borderBottomColor="gray.700"
                      _hover={{ backgroundColor: "gray.800" }}
                    >
                      <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700">
                        <Checkbox
                          isChecked={isChecked}
                          onChange={(e) => handleToggle(e.target.checked)}
                          colorScheme="blue"
                        />
                      </Td>
                      <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700">
                        <Text color="white" fontSize="sm">
                          {argKey}
                        </Text>
                      </Td>
                      <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700">
                        <Badge
                          backgroundColor="gray.700"
                          color="gray.300"
                          paddingX={2}
                          paddingY={1}
                          borderRadius="md"
                          fontSize="xs"
                        >
                          {arg.type || "unknown"}
                        </Badge>
                      </Td>
                      <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700" width="15%">
                        {isChecked ? (
                          <Input
                            value={argConfig?.label || ""}
                            onChange={(e) => handleLabelChange(e.target.value)}
                            placeholder={argKey}
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="white"
                            fontSize="sm"
                            size="sm"
                            width="100%"
                          />
                        ) : (
                          <Input
                            value=""
                            placeholder={argKey}
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="gray.500"
                            fontSize="sm"
                            size="sm"
                            disabled
                            width="100%"
                          />
                        )}
                      </Td>
                      <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700">
                        {isUint && isChecked ? (
                          <Select
                            value={currentFormatType}
                            onChange={(e) => handleFormatTypeChange(e.target.value)}
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="white"
                            fontSize="sm"
                            size="sm"
                            width="100%"
                          >
                            <option value="decimals">Decimals</option>
                            <option value="formula">Formula</option>
                          </Select>
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            N/A
                          </Text>
                        )}
                      </Td>
                      <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700" width="35%">
                        {isUint && isChecked ? (
                          currentFormatType === "decimals" ? (
                            <Input
                              type="number"
                              value={
                                argConfig?.decimals !== undefined && argConfig.decimals !== 0 ? argConfig.decimals : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "") {
                                  // Allow empty - will be treated as 0 in backend
                                  handleDecimalsChange(undefined);
                                } else {
                                  const numValue = parseInt(value, 10);
                                  if (!isNaN(numValue) && numValue >= 0) {
                                    handleDecimalsChange(numValue);
                                  }
                                }
                              }}
                              placeholder="e.g., 18"
                              backgroundColor="gray.900"
                              borderColor="gray.700"
                              color="white"
                              fontSize="sm"
                              size="sm"
                              width="100%"
                            />
                          ) : (
                            <FormControl isInvalid={!formulaValidation.isValid}>
                              <Input
                                value={argConfig?.formula || ""}
                                onChange={(e) => handleFormulaChange(e.target.value)}
                                placeholder="e.g., (pow(1 + value, 365) - 1) * 100"
                                backgroundColor="gray.900"
                                borderColor={formulaValidation.isValid ? "gray.700" : "red.500"}
                                color="white"
                                fontSize="sm"
                                size="sm"
                                width="100%"
                              />
                              {!formulaValidation.isValid && formulaValidation.error && (
                                <FormErrorMessage fontSize="xs" marginTop={1}>
                                  {formulaValidation.error}
                                </FormErrorMessage>
                              )}
                            </FormControl>
                          )
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            N/A
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      )}

      <VStack alignItems="flex-start" gap={4}>
        <Heading as="h3" size="md" color="white">
          Message Fields
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Select which fields to include in notifications
        </Text>
        <SimpleGrid columns={5} gap={3} width="100%">
          <MessageCheckbox
            isChecked={displayConfig.label}
            onChange={(e) => handleCheckboxChange("label", e)}
            label="Label"
          />
          <MessageCheckbox
            isChecked={displayConfig.timestamp}
            onChange={(e) => handleCheckboxChange("timestamp", e)}
            label="Timestamp"
          />
          <MessageCheckbox
            isChecked={displayConfig.chain}
            onChange={(e) => handleCheckboxChange("chain", e)}
            label="Chain"
          />
          <MessageCheckbox
            isChecked={displayConfig.contract_address}
            onChange={(e) => handleCheckboxChange("contract_address", e)}
            label="Contract Address"
          />
          <MessageCheckbox
            isChecked={displayConfig.event_abi}
            onChange={(e) => handleCheckboxChange("event_abi", e)}
            label="Event ABI"
          />
          <MessageCheckbox
            isChecked={displayConfig.explorer_link}
            onChange={(e) => handleCheckboxChange("explorer_link", e)}
            label="Explorer Link"
          />
          <MessageCheckbox
            isChecked={displayConfig.layerzer_link}
            onChange={(e) => handleCheckboxChange("layerzer_link", e)}
            label="LayerZero Link"
          />
        </SimpleGrid>
      </VStack>
    </VStack>
  );
}
