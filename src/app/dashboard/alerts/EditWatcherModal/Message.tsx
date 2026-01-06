import {
  TabPanel,
  VStack,
  SimpleGrid,
  Checkbox,
  Box,
  HStack,
  Badge,
  FormControl,
  FormLabel,
  Input,
  Select,
  FormErrorMessage,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useMemo } from "react";
import { validateFormula } from "../../../../../convex/helpers/formulaUtils";
import { FormulaInformation } from "../../components/FormulaInformation";
import { EventArg, DisplayConfig } from "@/app/shared/types";
import {
  toggleArgDisplay as toggleArgDisplayUtil,
  updateArgConfig as updateArgConfigUtil,
  handleFormatTypeChange as handleFormatTypeChangeUtil,
  getFormatType,
} from "@/app/shared/helpers";

export const Message = ({
  displayConfig,
  setDisplayConfig,
  eventArgs,
}: {
  displayConfig: DisplayConfig;
  setDisplayConfig: (displayConfig: DisplayConfig) => void;
  eventArgs: EventArg[];
}) => {
  return (
    <TabPanel paddingX={0} paddingTop={4}>
      <VStack gap={6} alignItems="stretch">
        {eventArgs.length > 0 && (
          <VStack alignItems="flex-start" gap={4}>
            <VStack alignItems="flex-start" gap={2}>
              <Text color="gray.300" fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
                Event Arguments
              </Text>
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
                    <Th
                      padding={3}
                      textAlign="left"
                      color="gray.400"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                      width="60px"
                    >
                      Show
                    </Th>
                    <Th
                      padding={3}
                      textAlign="left"
                      color="gray.400"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                    >
                      Argument
                    </Th>
                    <Th
                      padding={3}
                      textAlign="left"
                      color="gray.400"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                    >
                      Type
                    </Th>
                    <Th
                      padding={3}
                      textAlign="left"
                      color="gray.400"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                    >
                      Custom Label
                    </Th>
                    <Th
                      padding={3}
                      textAlign="left"
                      color="gray.400"
                      fontSize="xs"
                      fontWeight="600"
                      textTransform="uppercase"
                      width="120px"
                    >
                      Format Type
                    </Th>
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
                  {eventArgs.map((arg: { name: string; type: string }, index: number) => {
                    const argKey = arg.name || `argument${index}`;
                    const argConfig = displayConfig.args.find((a: { key: string }) => a.key === argKey);
                    const isChecked = argConfig !== undefined;
                    const isUint = arg.type?.includes("uint");

                    const handleToggle = (checked: boolean) => {
                      if (checked) {
                        const updated = [...displayConfig.args];
                        updated.push({
                          key: argKey,
                          label: argKey,
                          decimals: undefined,
                        });
                        setDisplayConfig({ ...displayConfig, args: updated });
                      } else {
                        setDisplayConfig(toggleArgDisplayUtil(displayConfig, argKey));
                      }
                    };

                    const handleLabelChange = (value: string) => {
                      setDisplayConfig(updateArgConfigUtil(displayConfig, argKey, "label", value));
                    };

                    const handleDecimalsChange = (value: number | undefined) => {
                      setDisplayConfig(updateArgConfigUtil(displayConfig, argKey, "decimals", value));
                    };

                    const handleFormulaChange = (value: string) => {
                      setDisplayConfig(updateArgConfigUtil(displayConfig, argKey, "formula", value || ""));
                    };

                    const handleFormatTypeChange = (formatType: string) => {
                      setDisplayConfig(
                        handleFormatTypeChangeUtil(displayConfig, argKey, formatType as "decimals" | "formula"),
                      );
                    };

                    // Determine current format type using shared utility
                    const currentFormatType = getFormatType(argConfig);

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
                        <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700" width="60px">
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
                        <Td padding={3} borderBottomWidth="1px" borderBottomColor="gray.700" width="120px">
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
                                  argConfig?.decimals !== undefined && argConfig.decimals !== 0
                                    ? argConfig.decimals
                                    : ""
                                }
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "") {
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

        <VStack gap={3} alignItems="stretch">
          <Text color="gray.300" fontSize="sm" fontWeight="500">
            Include in message
          </Text>
          <SimpleGrid columns={4} gap={2}>
            {[
              { key: "label", label: "Label" },
              { key: "timestamp", label: "Timestamp" },
              { key: "chain", label: "Chain" },
              { key: "contract_address", label: "Contract Address" },
              { key: "event_abi", label: "Event ABI" },
              { key: "explorer_link", label: "Explorer Link" },
              { key: "layerzer_link", label: "LayerZero Link" },
            ].map((opt) => (
              <Checkbox
                key={opt.key}
                isChecked={displayConfig[opt.key as keyof DisplayConfig] as boolean}
                onChange={(e) =>
                  setDisplayConfig({
                    ...displayConfig,
                    [opt.key]: e.target.checked,
                  })
                }
                borderColor="gray.700"
                borderWidth="1px"
                padding={2}
                borderRadius="lg"
              >
                <Text color="white" fontSize="sm" marginLeft={2}>
                  {opt.label}
                </Text>
              </Checkbox>
            ))}
          </SimpleGrid>
        </VStack>
      </VStack>
    </TabPanel>
  );
};
