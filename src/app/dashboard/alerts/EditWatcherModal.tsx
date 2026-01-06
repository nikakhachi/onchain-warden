"use client";

import { useState, useEffect, useRef } from "react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  Checkbox,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { parseAbiItem } from "viem";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Button as CustomButton } from "../../components/Button";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { CreateIntegrationDialog } from "../../dashboard/integrations/Dialog";
import { eventToFormattedArgs, normalizeDisplayConfig } from "../../helpers";
import { Event } from "../../dashboard/create-alert/components/context/interfaces";
import { validateFormula } from "../../../../convex/helpers/formulaUtils";
import { useMemo } from "react";
import { FormulaInformation } from "../components/FormulaInformation";
import { CloseIcon } from "@chakra-ui/icons";

interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface DisplayConfig {
  timestamp: boolean;
  label: boolean;
  chain: boolean;
  contract_address: boolean;
  event_abi: boolean;
  explorer_link: boolean;
  layerzer_link: boolean;
  args: Array<{ key: string; label?: string; decimals?: number; formula?: string }>;
}

interface EditWatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  watcher: {
    eventWatcher: Doc<"event_watchers">;
    chain: { name: string } | null;
  } | null;
}

const operators = ["==", "!=", ">", ">=", "<", "<="];

const getOperatorLabel = (op: string) => {
  const labels: Record<string, string> = {
    "==": "Equals",
    "!=": "Not Equals",
    ">": "Greater Than",
    ">=": "Greater Than or Equal",
    "<": "Less Than",
    "<=": "Less Than or Equal",
  };
  return labels[op] || op;
};

const getEventName = (abi: string) => {
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
};

export function EditWatcherModal({ isOpen, onClose, watcher }: EditWatcherModalProps) {
  const { teamIntegrations, integrations, updateEventWatcher, currentTeamId, watcherIntegrations } = useUser();
  const { error: showError, success: showSuccess } = useToast();

  const [label, setLabel] = useState("");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
    timestamp: true,
    label: true,
    chain: true,
    contract_address: true,
    event_abi: true,
    explorer_link: true,
    layerzer_link: true,
    args: [],
  });
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<Id<"team_integrations">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const initializedWatcherIdRef = useRef<Id<"event_watchers"> | null>(null);
  const lastSavedWatcherIdRef = useRef<Id<"event_watchers"> | null>(null);

  // Parse event arguments from ABI - handles tuples correctly
  const parseEventArgs = (): Array<{
    name: string;
    type: string;
    indexed?: boolean;
    internalType?: string;
  }> => {
    if (!watcher?.eventWatcher.event_abi) return [];
    try {
      const parsed = parseAbiItem(watcher.eventWatcher.event_abi) as Event;
      if (parsed.type === "event" && parsed.inputs) {
        // Use eventToFormattedArgs to handle tuple arguments correctly
        return eventToFormattedArgs(parsed);
      }
    } catch (e) {
      // If parseAbiItem fails (e.g., tuple format), try fallback parsing
      const match = watcher.eventWatcher.event_abi.match(/\(([^)]+)\)/);
      if (match) {
        return match[1].split(",").map((arg, idx) => {
          const parts = arg.trim().split(" ");
          const type = parts[0] || "unknown";
          // Check if last part is a type (starts with lowercase) or a name
          const lastPart = parts[parts.length - 1];
          const isType = lastPart && /^(address|uint|int|bytes|bool|string)/.test(lastPart.toLowerCase());
          const name = isType ? `argument${idx}` : lastPart || `argument${idx}`;
          return { name, type, indexed: false };
        });
      }
    }
    return [];
  };

  const eventArgs = parseEventArgs();
  const defaultDisplayConfig: DisplayConfig = {
    timestamp: true,
    label: true,
    chain: true,
    contract_address: true,
    event_abi: true,
    explorer_link: true,
    layerzer_link: true,
    args: [],
  };

  useEffect(() => {
    if (
      watcher &&
      watcher.eventWatcher._id !== initializedWatcherIdRef.current &&
      watcher.eventWatcher._id !== lastSavedWatcherIdRef.current
    ) {
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      setLabel(watcher.eventWatcher.label || "");
      setConditions(watcher.eventWatcher.condition || []);
      setDisplayConfig(watcher.eventWatcher.display || defaultDisplayConfig);

      // Get team_integration_ids from watcherIntegrations
      const watcherIntegrationIds =
        watcherIntegrations
          ?.filter((wi) => wi.event_watcher_id === watcher.eventWatcher._id)
          .map((wi) => wi.team_integration_id) || [];
      setSelectedIntegrationIds(watcherIntegrationIds);
    }
  }, [watcher?.eventWatcher._id, isOpen, watcherIntegrations]);

  // Reset refs when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedWatcherIdRef.current = null;
      lastSavedWatcherIdRef.current = null;
    }
  }, [isOpen]);

  const addCondition = () => {
    setConditions([...conditions, { field: eventArgs[0]?.name || "", operator: ">=", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const getOperators = (argType: string) => {
    if (argType?.includes("uint") || argType?.includes("int")) {
      return ["==", "!=", ">", ">=", "<", "<="];
    }
    return ["==", "!="];
  };

  const toggleIntegration = (id: Id<"team_integrations">) => {
    if (selectedIntegrationIds.includes(id)) {
      setSelectedIntegrationIds(selectedIntegrationIds.filter((i) => i !== id));
    } else {
      setSelectedIntegrationIds([...selectedIntegrationIds, id]);
    }
  };

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

  // Check if all formulas are valid
  const hasInvalidFormulas = useMemo(() => {
    return displayConfig.args.some((arg) => {
      if (arg.formula && arg.formula.trim() !== "") {
        const validation = validateFormula(arg.formula);
        return !validation.isValid;
      }
      return false;
    });
  }, [displayConfig.args]);

  const handleSave = async () => {
    if (!watcher || !currentTeamId) return;

    if (selectedIntegrationIds.length === 0) {
      showError("Please select at least one integration");
      return;
    }

    if (hasInvalidFormulas) {
      showError("Please fix all formula errors before saving");
      return;
    }

    setIsSubmitting(true);

    try {
      await updateEventWatcher({
        id: watcher.eventWatcher._id,
        label: label.trim(),
        condition: conditions,
        display: normalizeDisplayConfig(displayConfig),
        team_integration_ids: selectedIntegrationIds,
      });

      lastSavedWatcherIdRef.current = watcher.eventWatcher._id;
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      showSuccess("Alert updated successfully");
      onClose();
    } catch (error: any) {
      showError(error.data || "Failed to update alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (watcher) {
      setLabel(watcher.eventWatcher.label || "");
      setConditions(watcher.eventWatcher.condition || []);
      setDisplayConfig(watcher.eventWatcher.display || defaultDisplayConfig);

      // Get team_integration_ids from watcherIntegrations
      const watcherIntegrationIds =
        watcherIntegrations
          ?.filter((wi) => wi.event_watcher_id === watcher.eventWatcher._id)
          .map((wi) => wi.team_integration_id) || [];
      setSelectedIntegrationIds(watcherIntegrationIds);
    }
    onClose();
  };

  if (!watcher) return null;

  const eventName = getEventName(watcher.eventWatcher.event_abi);
  const contractAddress = watcher.eventWatcher.contract_address || "";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white" maxW="1200px">
        <ModalHeader position="relative" paddingBottom={4}>
          <VStack alignItems="flex-start" gap={3} flex={1}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              Edit Alert
            </Text>
            <VStack alignItems="flex-start" gap={3} width="100%">
              <VStack alignItems="flex-start" gap={2} width="100%">
                <HStack gap={2} alignItems="center" width="100%">
                  <Text color="gray.400" fontSize="sm" minWidth="80px">
                    Contract:
                  </Text>
                  <Text color="blue.400" fontSize="sm" fontFamily="mono" wordBreak="break-all">
                    {contractAddress}
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="center" width="100%">
                  <Text color="gray.400" fontSize="sm" minWidth="80px">
                    Event:
                  </Text>
                  <Badge
                    backgroundColor="blue.500"
                    color="white"
                    paddingX={2}
                    paddingY={1}
                    borderRadius="md"
                    fontSize="xs"
                  >
                    {eventName}
                  </Badge>
                  <Text color="gray.400" fontSize="sm">
                    on {watcher.chain?.name || "Unknown"}
                  </Text>
                </HStack>
              </VStack>
              <FormControl width="100%">
                <FormLabel color="gray.300" marginBottom={2} fontSize="sm">
                  Alert Label
                </FormLabel>
                <Input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., My Alert"
                  borderColor="gray.700"
                  backgroundColor="gray.800"
                  color="white"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
              </FormControl>
            </VStack>
          </VStack>
          <ModalCloseButton position="absolute" top={0} right={0} />
        </ModalHeader>
        <ModalBody>
          <Tabs colorScheme="blue" defaultIndex={0}>
            <TabList borderBottomWidth="1px" borderBottomColor="gray.700">
              <Tab color="gray.400" _selected={{ color: "white", borderColor: "blue.500" }}>
                Conditions
              </Tab>
              <Tab color="gray.400" _selected={{ color: "white", borderColor: "blue.500" }}>
                Message
              </Tab>
              <Tab color="gray.400" _selected={{ color: "white", borderColor: "blue.500" }}>
                Integrations
              </Tab>
            </TabList>

            <TabPanels>
              {/* Conditions Tab */}
              <TabPanel paddingX={0} paddingTop={4}>
                <VStack gap={4} alignItems="stretch">
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
                        No conditions set
                      </Text>
                    </Box>
                  ) : (
                    <VStack gap={3} alignItems="stretch" maxH="300px" overflowY="auto">
                      {conditions.map((condition, index) => {
                        const arg = eventArgs.find((a: { name: string; type: string }) => a.name === condition.field);
                        const availableOperators = getOperators(arg?.type || "");

                        return (
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
                            >
                              {eventArgs.map((arg: { name: string; type: string }, argIndex: number) => (
                                <option key={argIndex} value={arg.name}>
                                  {arg.name} ({arg.type})
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
                              {availableOperators.map((op) => (
                                <option key={op} value={op}>
                                  {getOperatorLabel(op)}
                                </option>
                              ))}
                            </Select>
                            <Input
                              flex={1}
                              value={condition.value}
                              onChange={(e) => updateCondition(index, "value", e.target.value)}
                              placeholder="Value"
                              backgroundColor="gray.800"
                              borderColor="gray.700"
                              color="white"
                            />
                            <Box as="button" onClick={() => removeCondition(index)} padding={2}>
                              <CloseIcon fontSize="xs" color="gray.400" />
                            </Box>
                          </HStack>
                        );
                      })}
                    </VStack>
                  )}
                  <CustomButton variant="secondary" size="sm" onClick={addCondition} alignSelf="flex-start">
                    + Add Condition
                  </CustomButton>
                </VStack>
              </TabPanel>

              {/* Message Tab */}
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
                      <Text
                        color="gray.300"
                        fontSize="sm"
                        fontWeight="600"
                        textTransform="uppercase"
                        letterSpacing="0.5px"
                      >
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
                                <Box
                                  padding={4}
                                  backgroundColor="gray.800"
                                  borderTopWidth="1px"
                                  borderTopColor="gray.700"
                                >
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

              {/* Integrations Tab */}
              <TabPanel paddingX={0} paddingTop={4}>
                <VStack gap={4} alignItems="stretch">
                  <HStack justifyContent="space-between" alignItems="center" width="100%">
                    <Text color="gray.300" fontSize="sm" fontWeight="500">
                      Select integrations
                    </Text>
                    <CustomButton variant="primary" size="sm" onClick={() => setIsIntegrationDialogOpen(true)}>
                      + Add Integration
                    </CustomButton>
                  </HStack>
                  {teamIntegrations && teamIntegrations.length > 0 ? (
                    <Box maxH="400px" overflowY="auto">
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} gap={3}>
                        {teamIntegrations.map((teamIntegration: any) => {
                          const integration = integrations?.find((i: any) => i._id === teamIntegration.integration_id);
                          const isSelected = selectedIntegrationIds.includes(teamIntegration._id);

                          return (
                            <Box
                              key={teamIntegration._id}
                              padding={4}
                              borderRadius="xl"
                              backgroundColor="gray.800"
                              borderWidth="2px"
                              borderColor={isSelected ? "blue.500" : "gray.700"}
                              cursor="pointer"
                              onClick={() => toggleIntegration(teamIntegration._id)}
                              transition="all 0.2s"
                              _hover={{
                                borderColor: isSelected ? "blue.500" : "gray.600",
                              }}
                            >
                              <HStack gap={4} alignItems="center">
                                <Checkbox
                                  isChecked={isSelected}
                                  onChange={() => toggleIntegration(teamIntegration._id)}
                                  borderColor="gray.600"
                                />
                                <Box width="24px" height="24px">
                                  <IntegrationIcon name={integration?.name || "Unknown"} />
                                </Box>
                                <VStack alignItems="flex-start" gap={0} flex={1}>
                                  <Text color="white" fontWeight="500" fontSize="sm">
                                    {teamIntegration.label}
                                  </Text>
                                  <Text color="gray.400" fontSize="xs">
                                    {integration?.name}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          );
                        })}
                      </SimpleGrid>
                    </Box>
                  ) : (
                    <Box
                      padding={8}
                      textAlign="center"
                      borderRadius="xl"
                      backgroundColor="gray.800"
                      borderWidth="1px"
                      borderColor="gray.700"
                    >
                      <Text color="gray.400" fontSize="sm">
                        You don't have any integrations yet.
                      </Text>
                    </Box>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <CustomButton variant="secondary" size="sm" onClick={handleClose} marginRight={3}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || selectedIntegrationIds.length === 0 || hasInvalidFormulas}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
      <CreateIntegrationDialog isOpen={isIntegrationDialogOpen} onClose={() => setIsIntegrationDialogOpen(false)} />
    </Modal>
  );
}
