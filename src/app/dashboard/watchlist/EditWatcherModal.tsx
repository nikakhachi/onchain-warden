"use client";

import { useState, useEffect, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
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
  Button,
  Box,
  Checkbox,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
} from "@chakra-ui/react";
import { parseAbiItem } from "viem";
import { useWallet } from "../../providers/WalletContext";
import { Button as CustomButton } from "../../components/Button";
import { generateSignatureData } from "@/app/helpers";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { CreateIntegrationDialog } from "../../dashboard/integrations/Dialog";

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
  args: Array<{ key: string; label?: string; decimals?: number }>;
}

interface EditWatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  watcher: {
    eventWatcher: {
      _id: Id<"event_watchers">;
      label: string;
      event_abi: string;
      contract_address: string;
      condition: Condition[];
      display: DisplayConfig;
      owner_integration_ids: Id<"owner_integrations">[];
    };
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

export function EditWatcherModal({
  isOpen,
  onClose,
  watcher,
}: EditWatcherModalProps) {
  const { address, signMessage, isSigning } = useWallet();
  const updateEventWatcher = useAction(
    api.eventWatchers.updateEventWatcherAction
  );
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    address ? { owner: address } : "skip"
  );
  const integrations = useQuery(api.integrations.getIntegrations);

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
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<
    Id<"owner_integrations">[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const initializedWatcherIdRef = useRef<Id<"event_watchers"> | null>(null);
  const lastSavedWatcherIdRef = useRef<Id<"event_watchers"> | null>(null);

  // Parse event arguments from ABI
  const parseEventArgs = () => {
    if (!watcher?.eventWatcher.event_abi) return [];
    try {
      const parsed = parseAbiItem(watcher.eventWatcher.event_abi) as any;
      if (parsed.type === "event" && parsed.inputs) {
        return parsed.inputs.map((input: any) => ({
          name: input.name || "",
          type: input.type || "",
          indexed: input.indexed || false,
        }));
      }
    } catch (e) {
      // Fallback parsing
      const match = watcher.eventWatcher.event_abi.match(/\(([^)]+)\)/);
      if (match) {
        return match[1].split(",").map((arg, idx) => {
          const parts = arg.trim().split(" ");
          const name = parts[parts.length - 1] || `arg${idx}`;
          const type = parts[0] || "unknown";
          return { name, type, indexed: false };
        });
      }
    }
    return [];
  };

  const eventArgs = parseEventArgs();

  // Initialize state when watcher changes (only if it's a different watcher or first load)
  // Don't re-initialize if we just saved this watcher
  useEffect(() => {
    if (
      watcher &&
      watcher.eventWatcher._id !== initializedWatcherIdRef.current &&
      watcher.eventWatcher._id !== lastSavedWatcherIdRef.current
    ) {
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      setLabel(watcher.eventWatcher.label || "");
      setConditions(watcher.eventWatcher.condition || []);
      setDisplayConfig(
        watcher.eventWatcher.display || {
          timestamp: true,
          label: true,
          chain: true,
          contract_address: true,
          event_abi: true,
          explorer_link: true,
          layerzer_link: true,
          args: [],
        }
      );
      setSelectedIntegrationIds(
        watcher.eventWatcher.owner_integration_ids || []
      );

      // Initialize args config - only include args that are currently shown (in display.args)
      const existingArgs = watcher.eventWatcher.display?.args || [];
      setDisplayConfig((prev) => ({ ...prev, args: existingArgs }));
    }
  }, [watcher?.eventWatcher._id, isOpen]); // Only depend on watcher ID and modal open state

  // Reset refs when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedWatcherIdRef.current = null;
      lastSavedWatcherIdRef.current = null;
    }
  }, [isOpen]);

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: eventArgs[0]?.name || "", operator: ">=", value: "" },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof Condition,
    value: string
  ) => {
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

  const toggleIntegration = (id: Id<"owner_integrations">) => {
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
        args: [
          ...displayConfig.args,
          { key: argName, label: "", decimals: undefined },
        ],
      });
    }
  };

  const updateArgConfig = (
    argName: string,
    field: "label" | "decimals",
    value: string | number
  ) => {
    setDisplayConfig({
      ...displayConfig,
      args: displayConfig.args.map((arg) =>
        arg.key === argName ? { ...arg, [field]: value } : arg
      ),
    });
  };

  const handleSave = async () => {
    if (!address || !watcher) return;

    setIsSubmitting(true);

    try {
      let signature: string;
      const { message, expiresAt, nonce } = generateSignatureData();
      try {
        signature = await signMessage(message);
      } catch (error) {
        alert(
          `Error: ${
            error instanceof Error
              ? error.message
              : "Failed to sign message. Please try again."
          }`
        );
        setIsSubmitting(false);
        return;
      }

      await updateEventWatcher({
        id: watcher.eventWatcher._id,
        label: label.trim(),
        condition: conditions,
        display: displayConfig,
        owner_integration_ids: selectedIntegrationIds,
        owner: address,
        signature,
        expiresAt,
        nonce,
      });

      // Mark this watcher as saved to prevent re-initialization with stale data
      lastSavedWatcherIdRef.current = watcher.eventWatcher._id;
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      alert("Success: Watcher updated successfully!");
      onClose();
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to update watcher"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (watcher) {
      setLabel(watcher.eventWatcher.label || "");
      setConditions(watcher.eventWatcher.condition || []);
      setDisplayConfig(
        watcher.eventWatcher.display || {
          timestamp: true,
          label: true,
          chain: true,
          contract_address: true,
          event_abi: true,
          explorer_link: true,
          layerzer_link: true,
          args: [],
        }
      );
      setSelectedIntegrationIds(
        watcher.eventWatcher.owner_integration_ids || []
      );
    }
    onClose();
  };

  if (!watcher) return null;

  const eventName = getEventName(watcher.eventWatcher.event_abi);
  const contractAddress = watcher.eventWatcher.contract_address || "";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay
        backgroundColor="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
      />
      <ModalContent
        backgroundColor="gray.900"
        borderColor="gray.800"
        borderWidth="1px"
        color="white"
        maxW="800px"
      >
        <ModalHeader position="relative" paddingBottom={4}>
          <VStack alignItems="flex-start" gap={3} flex={1}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              Edit Watcher
            </Text>
            <VStack alignItems="flex-start" gap={2} width="100%">
              <HStack gap={2} alignItems="center" width="100%">
                <Text color="gray.400" fontSize="sm" minWidth="80px">
                  Contract:
                </Text>
                <Text
                  color="blue.400"
                  fontSize="sm"
                  fontFamily="mono"
                  wordBreak="break-all"
                >
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
          </VStack>
          <ModalCloseButton position="absolute" top={0} right={0} />
        </ModalHeader>
        <ModalBody>
          <Tabs colorScheme="blue" defaultIndex={0}>
            <TabList borderBottomWidth="1px" borderBottomColor="gray.700">
              <Tab
                color="gray.400"
                _selected={{ color: "white", borderColor: "blue.500" }}
              >
                General
              </Tab>
              <Tab
                color="gray.400"
                _selected={{ color: "white", borderColor: "blue.500" }}
              >
                Conditions
              </Tab>
              <Tab
                color="gray.400"
                _selected={{ color: "white", borderColor: "blue.500" }}
              >
                Message
              </Tab>
              <Tab
                color="gray.400"
                _selected={{ color: "white", borderColor: "blue.500" }}
              >
                Integrations
              </Tab>
            </TabList>

            <TabPanels>
              {/* General Tab */}
              <TabPanel paddingX={0} paddingTop={4}>
                <VStack gap={4} alignItems="stretch">
                  <FormControl>
                    <FormLabel color="gray.300" marginBottom={2}>
                      Watcher Label
                    </FormLabel>
                    <Input
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="e.g., My Watcher"
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
              </TabPanel>

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
                    <VStack
                      gap={3}
                      alignItems="stretch"
                      maxH="300px"
                      overflowY="auto"
                    >
                      {conditions.map((condition, index) => {
                        const arg = eventArgs.find(
                          (a: { name: string; type: string }) =>
                            a.name === condition.field
                        );
                        const availableOperators = getOperators(
                          arg?.type || ""
                        );

                        return (
                          <HStack key={index} gap={3} alignItems="flex-start">
                            <Select
                              flex={1}
                              value={condition.field}
                              onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>
                              ) =>
                                updateCondition(index, "field", e.target.value)
                              }
                              backgroundColor="gray.800"
                              borderColor="gray.700"
                              color="white"
                            >
                              {eventArgs.map(
                                (
                                  arg: { name: string; type: string },
                                  argIndex: number
                                ) => (
                                  <option key={argIndex} value={arg.name}>
                                    {arg.name} ({arg.type})
                                  </option>
                                )
                              )}
                            </Select>
                            <Select
                              flex={1}
                              value={condition.operator}
                              onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>
                              ) =>
                                updateCondition(
                                  index,
                                  "operator",
                                  e.target.value
                                )
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
                              onChange={(e) =>
                                updateCondition(index, "value", e.target.value)
                              }
                              placeholder="Value"
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
                        );
                      })}
                    </VStack>
                  )}
                  <CustomButton
                    variant="secondary"
                    size="sm"
                    onClick={addCondition}
                    alignSelf="flex-start"
                  >
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
                        { key: "timestamp", label: "Time" },
                        { key: "label", label: "Label" },
                        { key: "chain", label: "Chain" },
                        { key: "contract_address", label: "Contract" },
                        { key: "event_abi", label: "Event" },
                        { key: "explorer_link", label: "Explorer" },
                        { key: "layerzer_link", label: "LayerZero" },
                      ].map((opt) => (
                        <Checkbox
                          key={opt.key}
                          isChecked={
                            displayConfig[
                              opt.key as keyof DisplayConfig
                            ] as boolean
                          }
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
                    <VStack gap={3} alignItems="stretch">
                      <Text color="gray.300" fontSize="sm" fontWeight="500">
                        Event arguments
                      </Text>
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
                            <Tr
                              borderBottomWidth="1px"
                              borderBottomColor="gray.700"
                            >
                              <Th
                                padding={3}
                                textAlign="left"
                                color="gray.400"
                                fontSize="xs"
                                fontWeight="600"
                                textTransform="uppercase"
                                width="60px"
                                borderBottomWidth="1px"
                                borderBottomColor="gray.700"
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
                                borderBottomWidth="1px"
                                borderBottomColor="gray.700"
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
                                borderBottomWidth="1px"
                                borderBottomColor="gray.700"
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
                                borderBottomWidth="1px"
                                borderBottomColor="gray.700"
                              >
                                Label
                              </Th>
                              <Th
                                padding={3}
                                textAlign="left"
                                color="gray.400"
                                fontSize="xs"
                                fontWeight="600"
                                textTransform="uppercase"
                                borderBottomWidth="1px"
                                borderBottomColor="gray.700"
                              >
                                Decimals
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {eventArgs.map(
                              (
                                arg: { name: string; type: string },
                                index: number
                              ) => {
                                const isShown = displayConfig.args.some(
                                  (a: { key: string }) => a.key === arg.name
                                );
                                const argConfig = displayConfig.args.find(
                                  (a: { key: string }) => a.key === arg.name
                                );

                                return (
                                  <Tr
                                    key={index}
                                    borderBottomWidth="1px"
                                    borderBottomColor="gray.700"
                                  >
                                    <Td
                                      padding={3}
                                      borderBottomWidth="1px"
                                      borderBottomColor="gray.700"
                                    >
                                      <Checkbox
                                        isChecked={isShown}
                                        onChange={() =>
                                          toggleArgDisplay(arg.name)
                                        }
                                        borderColor="gray.600"
                                      />
                                    </Td>
                                    <Td
                                      padding={3}
                                      borderBottomWidth="1px"
                                      borderBottomColor="gray.700"
                                    >
                                      <Text
                                        color="white"
                                        fontSize="sm"
                                        fontFamily="mono"
                                      >
                                        {arg.name}
                                      </Text>
                                    </Td>
                                    <Td
                                      padding={3}
                                      borderBottomWidth="1px"
                                      borderBottomColor="gray.700"
                                    >
                                      <Badge
                                        backgroundColor="blue.500"
                                        color="white"
                                        paddingX={2}
                                        paddingY={1}
                                        borderRadius="md"
                                        fontSize="xs"
                                      >
                                        {arg.type}
                                      </Badge>
                                    </Td>
                                    <Td
                                      padding={3}
                                      borderBottomWidth="1px"
                                      borderBottomColor="gray.700"
                                    >
                                      {isShown && (
                                        <Input
                                          value={argConfig?.label || ""}
                                          onChange={(e) =>
                                            updateArgConfig(
                                              arg.name,
                                              "label",
                                              e.target.value
                                            )
                                          }
                                          placeholder="Custom label"
                                          size="sm"
                                          backgroundColor="gray.800"
                                          borderColor="gray.700"
                                          color="white"
                                          width="150px"
                                        />
                                      )}
                                    </Td>
                                    <Td
                                      padding={3}
                                      borderBottomWidth="1px"
                                      borderBottomColor="gray.700"
                                    >
                                      {isShown && (
                                        <Input
                                          type="number"
                                          value={argConfig?.decimals || ""}
                                          onChange={(e) =>
                                            updateArgConfig(
                                              arg.name,
                                              "decimals",
                                              e.target.value
                                                ? parseInt(e.target.value)
                                                : 0
                                            )
                                          }
                                          placeholder="Decimals"
                                          size="sm"
                                          backgroundColor="gray.800"
                                          borderColor="gray.700"
                                          color="white"
                                          width="100px"
                                        />
                                      )}
                                    </Td>
                                  </Tr>
                                );
                              }
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              {/* Integrations Tab */}
              <TabPanel paddingX={0} paddingTop={4}>
                <VStack gap={4} alignItems="stretch">
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    width="100%"
                  >
                    <Text color="gray.300" fontSize="sm" fontWeight="500">
                      Select integrations
                    </Text>
                    <CustomButton
                      variant="primary"
                      size="sm"
                      onClick={() => setIsIntegrationDialogOpen(true)}
                    >
                      + Add Integration
                    </CustomButton>
                  </HStack>
                  {ownerIntegrations && ownerIntegrations.length > 0 ? (
                    <VStack
                      gap={3}
                      alignItems="stretch"
                      maxH="400px"
                      overflowY="auto"
                    >
                      {ownerIntegrations.map((ownerIntegration: any) => {
                        const integration = integrations?.find(
                          (i: any) => i._id === ownerIntegration.integration_id
                        );
                        const isSelected = selectedIntegrationIds.includes(
                          ownerIntegration._id
                        );

                        return (
                          <Box
                            key={ownerIntegration._id}
                            padding={4}
                            borderRadius="xl"
                            backgroundColor="gray.800"
                            borderWidth="2px"
                            borderColor={isSelected ? "blue.500" : "gray.700"}
                            cursor="pointer"
                            onClick={() =>
                              toggleIntegration(ownerIntegration._id)
                            }
                            transition="all 0.2s"
                            _hover={{
                              borderColor: isSelected ? "blue.500" : "gray.600",
                            }}
                          >
                            <HStack gap={4}>
                              <Checkbox
                                isChecked={isSelected}
                                onChange={() =>
                                  toggleIntegration(ownerIntegration._id)
                                }
                                borderColor="gray.600"
                              />
                              <Box width="40px" height="40px">
                                <IntegrationIcon
                                  name={integration?.name || "Unknown"}
                                />
                              </Box>
                              <VStack alignItems="flex-start" gap={1} flex={1}>
                                <Text color="white" fontWeight="500">
                                  {ownerIntegration.label}
                                </Text>
                                <Text color="gray.400" fontSize="sm">
                                  {integration?.name || "Unknown"} • Chat ID:{" "}
                                  {ownerIntegration.data?.chatId ||
                                    ownerIntegration.data?.chat_id ||
                                    "N/A"}
                                </Text>
                              </VStack>
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
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
          <CustomButton
            variant="secondary"
            size="sm"
            onClick={handleClose}
            marginRight={3}
          >
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSigning || isSubmitting}
          >
            {isSigning || isSubmitting ? "Saving..." : "Save Changes"}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
      <CreateIntegrationDialog
        isOpen={isIntegrationDialogOpen}
        onClose={() => setIsIntegrationDialogOpen(false)}
      />
    </Modal>
  );
}
