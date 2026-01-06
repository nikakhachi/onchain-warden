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
} from "@chakra-ui/react";
import { useMemo } from "react";
import { validateFormula } from "../../../../../convex/helpers/formulaUtils";
import { FormulaInformation } from "../../components/FormulaInformation";
import { EventArg, DisplayConfig } from ".";

export const Message = ({
  displayConfig,
  setDisplayConfig,
  eventArgs,
}: {
  displayConfig: DisplayConfig;
  setDisplayConfig: (displayConfig: DisplayConfig) => void;
  eventArgs: EventArg[];
}) => {
  const toggleArgDisplay = (argName: string) => {
    const existing = displayConfig.args.find((a) => a.key === argName);
    if (existing) {
      // Remove from args
      setDisplayConfig({
        ...displayConfig,
        args: displayConfig.args.filter((a) => a.key !== argName),
      });
    } else {
      // Add to args
      setDisplayConfig({
        ...displayConfig,
        args: [...displayConfig.args, { key: argName, label: "", decimals: undefined, formula: undefined }],
      });
    }
  };

  const updateArgConfig = (
    argName: string,
    field: "label" | "decimals" | "formula",
    value: string | number | undefined,
  ) => {
    setDisplayConfig({
      ...displayConfig,
      args: displayConfig.args.map((arg) => {
        if (arg.key === argName) {
          if (field === "decimals") {
            // When setting decimals, clear formula
            return { ...arg, decimals: value as number | undefined, formula: undefined };
          } else if (field === "formula") {
            // When setting formula, clear decimals
            return { ...arg, formula: value as string | undefined, decimals: undefined };
          } else if (field === "label") {
            // When setting label, ensure it's a string
            return { ...arg, label: value as string | undefined };
          }
          return arg;
        }
        return arg;
      }),
    });
  };

  const handleFormatTypeChange = (argName: string, formatType: string) => {
    setDisplayConfig({
      ...displayConfig,
      args: displayConfig.args.map((arg) => {
        if (arg.key === argName) {
          if (formatType === "decimals") {
            // Switching to decimals: clear formula
            return { ...arg, formula: undefined };
          } else if (formatType === "formula") {
            // Switching to formula: clear decimals, keep formula (or set to empty string if none exists)
            return { ...arg, decimals: undefined, formula: arg.formula || "" };
          }
        }
        return arg;
      }),
    });
  };

  return (
    <TabPanel paddingX={0} paddingTop={4}>
      <VStack gap={6} alignItems="stretch">
        <VStack gap={3} alignItems="stretch">
          <Text color="gray.300" fontSize="sm" fontWeight="500">
            Include in message
          </Text>
          <SimpleGrid columns={3} gap={2}>
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

        {eventArgs.length > 0 && (
          <VStack gap={4} alignItems="stretch">
            <Text color="gray.300" fontSize="sm" fontWeight="600" textTransform="uppercase" letterSpacing="0.5px">
              Event Arguments
            </Text>
            <VStack gap={3} alignItems="stretch">
              {eventArgs.map((arg: { name: string; type: string }, index: number) => {
                const isShown = displayConfig.args.some((a: { key: string }) => a.key === arg.name);
                const argConfig = displayConfig.args.find((a: { key: string }) => a.key === arg.name);
                const isUint = arg.type?.includes("uint");

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
                  <Box
                    key={index}
                    borderRadius="xl"
                    borderWidth="2px"
                    borderColor={isShown ? "blue.500" : "gray.700"}
                    backgroundColor={isShown ? "gray.800" : "gray.900"}
                    overflow="hidden"
                    transition="all 0.2s"
                    _hover={{ borderColor: isShown ? "blue.400" : "gray.600" }}
                  >
                    {/* Header Section */}
                    <HStack
                      padding={4}
                      backgroundColor={isShown ? "gray.800" : "gray.900"}
                      cursor="pointer"
                      onClick={() => toggleArgDisplay(arg.name)}
                      _hover={{ backgroundColor: isShown ? "gray.700" : "gray.800" }}
                      transition="background-color 0.2s"
                    >
                      <Checkbox
                        isChecked={isShown}
                        onChange={() => toggleArgDisplay(arg.name)}
                        borderColor="gray.600"
                        colorScheme="blue"
                        size="lg"
                      />
                      <VStack alignItems="flex-start" gap={1} flex={1}>
                        <HStack gap={2} alignItems="center">
                          <Text color="white" fontSize="md" fontFamily="mono" fontWeight="600">
                            {arg.name}
                          </Text>
                          <Badge
                            backgroundColor={isShown ? "blue.500" : "gray.600"}
                            color="white"
                            paddingX={3}
                            paddingY={1}
                            borderRadius="md"
                            fontSize="xs"
                            fontWeight="600"
                          >
                            {arg.type}
                          </Badge>
                        </HStack>
                      </VStack>
                    </HStack>

                    {/* Configuration Section - Only shown when checked */}
                    {isShown && (
                      <Box padding={4} backgroundColor="gray.800" borderTopWidth="1px" borderTopColor="gray.700">
                        <VStack gap={4} alignItems="stretch">
                          {/* Custom Label */}
                          <FormControl>
                            <FormLabel color="gray.300" fontSize="sm" fontWeight="500" marginBottom={2}>
                              Custom Label
                            </FormLabel>
                            <Input
                              value={argConfig?.label || ""}
                              onChange={(e) => updateArgConfig(arg.name, "label", e.target.value)}
                              placeholder={`Display name for ${arg.name}`}
                              size="md"
                              backgroundColor="gray.900"
                              borderColor="gray.700"
                              color="white"
                              _focus={{
                                borderColor: "blue.500",
                                boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                              }}
                            />
                          </FormControl>

                          {/* Format Configuration - Only for uint types */}
                          {isUint && (
                            <>
                              <Box height="1px" backgroundColor="gray.700" />
                              <FormControl>
                                <HStack alignItems="center" marginBottom={2}>
                                  <FormLabel color="gray.300" fontSize="sm" fontWeight="500" margin={0}>
                                    Number Formatting
                                  </FormLabel>
                                  {currentFormatType === "formula" && <FormulaInformation />}
                                </HStack>
                                <Select
                                  value={currentFormatType}
                                  onChange={(e) => handleFormatTypeChange(arg.name, e.target.value)}
                                  backgroundColor="gray.900"
                                  borderColor="gray.700"
                                  color="white"
                                  size="md"
                                  marginBottom={3}
                                  _focus={{
                                    borderColor: "blue.500",
                                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                                  }}
                                >
                                  <option value="decimals">Decimals</option>
                                  <option value="formula">Formula</option>
                                </Select>

                                {currentFormatType === "decimals" ? (
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
                                        updateArgConfig(arg.name, "decimals", undefined);
                                      } else {
                                        const numValue = parseInt(value, 10);
                                        if (!isNaN(numValue) && numValue >= 0) {
                                          updateArgConfig(arg.name, "decimals", numValue);
                                        }
                                      }
                                    }}
                                    placeholder="e.g., 18"
                                    backgroundColor="gray.900"
                                    borderColor="gray.700"
                                    color="white"
                                    _focus={{
                                      borderColor: "blue.500",
                                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                                    }}
                                  />
                                ) : (
                                  <FormControl isInvalid={!formulaValidation.isValid}>
                                    <Input
                                      value={argConfig?.formula || ""}
                                      onChange={(e) =>
                                        updateArgConfig(arg.name, "formula", e.target.value || undefined)
                                      }
                                      placeholder="e.g., (pow(1 + value, 365) - 1) * 100"
                                      backgroundColor="gray.900"
                                      borderColor={formulaValidation.isValid ? "gray.700" : "red.500"}
                                      color="white"
                                      fontFamily="mono"
                                      _focus={{
                                        borderColor: formulaValidation.isValid ? "blue.500" : "red.500",
                                        boxShadow: formulaValidation.isValid
                                          ? "0 0 0 1px var(--chakra-colors-blue-500)"
                                          : "0 0 0 1px var(--chakra-colors-red-500)",
                                      }}
                                    />
                                    {!formulaValidation.isValid && formulaValidation.error && (
                                      <FormErrorMessage fontSize="xs" marginTop={2}>
                                        {formulaValidation.error}
                                      </FormErrorMessage>
                                    )}
                                  </FormControl>
                                )}
                              </FormControl>
                            </>
                          )}
                        </VStack>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </VStack>
          </VStack>
        )}
      </VStack>
    </TabPanel>
  );
};
