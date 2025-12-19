"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { parseAbiItem, isAddress, getAddress } from "viem";
import {
  Box,
  Button,
  Input,
  Textarea,
  Heading,
  Stack,
  Spinner,
  Text,
  HStack,
  VStack,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
} from "@chakra-ui/react";
import { useWallet } from "../providers/WalletContext";
import {
  CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE,
  CREATE_OWNER_INTEGRATION_SIGN_MESSAGE,
} from "../constants";
import { READY_EVENTS } from "../data/readyEvents";

export function EventSubscriptionForm() {
  const { isConnected, address, signMessage, isSigning } = useWallet();

  const [chainId, setChainId] = useState<Id<"chains"> | "">("");
  const [contractAddress, setContractAddress] = useState("");
  const [eventAbi, setEventAbi] = useState("");
  const [selectedOwnerIntegrationIds, setSelectedOwnerIntegrationIds] =
    useState<Id<"owner_integrations">[]>([]);

  // State for creating new owner integration
  const [showCreateIntegration, setShowCreateIntegration] = useState(false);
  const [newIntegrationLabel, setNewIntegrationLabel] = useState("");
  const [newIntegrationTypeId, setNewIntegrationTypeId] = useState<
    Id<"integrations"> | ""
  >("");
  const [newIntegrationData, setNewIntegrationData] = useState<
    Record<string, string>
  >({});
  const [newIntegrationDataErrors, setNewIntegrationDataErrors] = useState<
    Record<string, string>
  >({});

  const [abiError, setAbiError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingIntegration, setIsCreatingIntegration] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // State for fetching events
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [eventsFetchError, setEventsFetchError] = useState("");
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [selectedEventIndex, setSelectedEventIndex] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // State for conditions
  const [conditions, setConditions] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([]);

  // State for template selection
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  const chains = useQuery(api.chains.getChains);
  const integrations = useQuery(api.integrations.getIntegrations);
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    address ? { owner: address } : "skip"
  );

  const createOwnerIntegration = useAction(
    api.ownerIntegrations.createOwnerIntegrationAction
  );
  const createEventWatcher = useAction(
    api.eventWatchers.createEventWatcherAction
  );

  const validateAbi = (abi: string) => {
    if (!abi.trim()) {
      setAbiError("");
      return false;
    }
    try {
      parseAbiItem(abi);
      setAbiError("");
      return true;
    } catch (error) {
      setAbiError(
        error instanceof Error ? error.message : "Invalid ABI event format"
      );
      return false;
    }
  };

  const handleAbiChange = (value: string) => {
    setEventAbi(value);
    validateAbi(value);
    // Clear template selection if user manually changes ABI
    if (selectedTemplate !== "") {
      setSelectedTemplate("");
    }
  };

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      setAddressError("");
      return false;
    }
    if (!isAddress(address.trim())) {
      setAddressError("Invalid EVM address format");
      return false;
    }
    setAddressError("");
    return true;
  };

  const handleAddressChange = (value: string) => {
    setContractAddress(value);
    validateAddress(value);
    // Reset event selection when address changes
    setEventAbi("");
    setSelectedEventIndex("");
    setSelectedEvent(null);
    setAvailableEvents([]);
    setEventsFetchError("");
    setUseManualEntry(false);
    setConditions([]);
    // Clear template selection if user manually changes address
    if (selectedTemplate !== "") {
      setSelectedTemplate("");
    }
  };

  // Fetch events when contract address is valid and chain is selected
  useEffect(() => {
    const fetchEvents = async () => {
      if (!contractAddress.trim() || !isAddress(contractAddress.trim())) {
        return;
      }

      if (!chainId) {
        return;
      }

      // Find the chain to get chain_id
      const selectedChain = chains?.find((c) => c._id === chainId);
      if (!selectedChain) {
        return;
      }

      setIsFetchingEvents(true);
      setEventsFetchError("");
      setUseManualEntry(false);

      try {
        const url = new URL("/api/fetch-events", window.location.origin);
        url.searchParams.set("contract_address", contractAddress.trim());
        url.searchParams.set("chain_id", selectedChain.chain_id.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch events");
        }

        const events = await response.json();
        if (Array.isArray(events) && events.length > 0) {
          setAvailableEvents(events);
        } else {
          throw new Error("No events found in contract ABI");
        }
      } catch (error) {
        setEventsFetchError(
          error instanceof Error ? error.message : "Failed to fetch events"
        );
        setUseManualEntry(true);
        setAvailableEvents([]);
      } finally {
        setIsFetchingEvents(false);
      }
    };

    // Debounce the fetch
    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [contractAddress, chainId, chains]);

  // Auto-select event from template when events are fetched
  useEffect(() => {
    if (
      selectedTemplate !== "" &&
      availableEvents.length > 0 &&
      !selectedEventIndex &&
      !useManualEntry
    ) {
      const template = READY_EVENTS[parseInt(selectedTemplate, 10)];
      if (!template) return;

      try {
        // Parse the template's event ABI to get the event name
        const parsedTemplateEvent = parseAbiItem(template.event_abi) as any;

        // Extract event name from parsed ABI or from the template string
        let templateEventName: string | undefined;

        if (parsedTemplateEvent.type === "event" && parsedTemplateEvent.name) {
          templateEventName = parsedTemplateEvent.name;
        } else {
          // Fallback: extract name from the event_abi string
          // Format: "event EventName(...)"
          const match = template.event_abi.match(/event\s+(\w+)\s*\(/);
          if (match && match[1]) {
            templateEventName = match[1];
          }
        }

        if (templateEventName) {
          // Find matching event in availableEvents
          const matchingEventIndex = availableEvents.findIndex((event) => {
            return event.name === templateEventName;
          });

          if (matchingEventIndex !== -1) {
            // Auto-select the matching event by directly setting state
            const event = availableEvents[matchingEventIndex];
            setSelectedEvent(event);
            setSelectedEventIndex(matchingEventIndex.toString());

            // Format the event ABI to a string format
            const name = event.name || "Unknown";
            const inputs = event.inputs || [];
            const inputString = inputs
              .map((input: any) => {
                const indexed = input.indexed ? " indexed" : "";
                const inputName = input.name ? ` ${input.name}` : "";
                return `${input.type}${indexed}${inputName}`;
              })
              .join(", ");
            const formatted = `event ${name}(${inputString})`;
            setEventAbi(formatted);
            validateAbi(formatted);
          }
        }
      } catch (error) {
        // If parsing fails, try to extract name from string
        const match = template.event_abi.match(/event\s+(\w+)\s*\(/);
        if (match && match[1]) {
          const templateEventName = match[1];
          const matchingEventIndex = availableEvents.findIndex((event) => {
            return event.name === templateEventName;
          });

          if (matchingEventIndex !== -1) {
            const event = availableEvents[matchingEventIndex];
            setSelectedEvent(event);
            setSelectedEventIndex(matchingEventIndex.toString());

            // Format the event ABI
            const name = event.name || "Unknown";
            const inputs = event.inputs || [];
            const inputString = inputs
              .map((input: any) => {
                const indexed = input.indexed ? " indexed" : "";
                const inputName = input.name ? ` ${input.name}` : "";
                return `${input.type}${indexed}${inputName}`;
              })
              .join(", ");
            const formatted = `event ${name}(${inputString})`;
            setEventAbi(formatted);
            validateAbi(formatted);
          }
        }
      }
    }
  }, [availableEvents, selectedTemplate, selectedEventIndex, useManualEntry]);

  const handleEventSelect = (eventIndex: string) => {
    setSelectedEventIndex(eventIndex);
    if (eventIndex === "") {
      setEventAbi("");
      setSelectedEvent(null);
      setConditions([]);
      return;
    }

    const index = parseInt(eventIndex, 10);
    if (isNaN(index) || !availableEvents[index]) {
      setEventAbi("");
      setSelectedEvent(null);
      setConditions([]);
      return;
    }

    const event = availableEvents[index];
    setSelectedEvent(event);
    // Format the event ABI to a string format
    const name = event.name || "Unknown";
    const inputs = event.inputs || [];
    const inputString = inputs
      .map((input: any) => {
        const indexed = input.indexed ? " indexed" : "";
        const inputName = input.name ? ` ${input.name}` : "";
        return `${input.type}${indexed}${inputName}`;
      })
      .join(", ");
    const formatted = `event ${name}(${inputString})`;
    setEventAbi(formatted);
    validateAbi(formatted);
    setConditions([]); // Reset conditions when event changes
  };

  // Get operators based on argument type
  const getOperatorsForType = (type: string): string[] => {
    if (type.startsWith("uint") || type.startsWith("int")) {
      return ["==", "!=", ">", ">=", "<", "<="];
    }
    if (type === "address") {
      return ["==", "!="];
    }
    if (type.startsWith("bytes")) {
      return ["==", "!="];
    }
    if (type === "string") {
      return ["==", "!="];
    }
    return ["==", "!="]; // Default
  };

  const addCondition = () => {
    if (
      !selectedEvent ||
      !selectedEvent.inputs ||
      selectedEvent.inputs.length === 0
    ) {
      return;
    }
    const firstInput = selectedEvent.inputs[0];
    setConditions([
      ...conditions,
      {
        field: firstInput.name || "",
        operator: getOperatorsForType(firstInput.type)[0],
        value: "",
      },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: "field" | "operator" | "value",
    value: string
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const validateIntegrationDataField = (
    fieldName: string,
    value: string,
    requiredFields: string[]
  ) => {
    const errors: Record<string, string> = { ...newIntegrationDataErrors };

    if (requiredFields.includes(fieldName)) {
      if (!value.trim()) {
        errors[fieldName] = "This field is required";
      } else {
        delete errors[fieldName];
      }
    } else {
      delete errors[fieldName];
    }

    setNewIntegrationDataErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllIntegrationData = (requiredFields: string[]) => {
    if (requiredFields.length === 0) {
      return true;
    }

    const errors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!newIntegrationData[field] || !newIntegrationData[field].trim()) {
        errors[field] = "This field is required";
        isValid = false;
      }
    });

    setNewIntegrationDataErrors(errors);
    return isValid;
  };

  const handleIntegrationTypeChange = (value: Id<"integrations"> | "") => {
    setNewIntegrationTypeId(value);
    setNewIntegrationData({});
    setNewIntegrationDataErrors({});
  };

  const handleIntegrationDataFieldChange = (
    fieldName: string,
    value: string
  ) => {
    const newData = { ...newIntegrationData, [fieldName]: value };
    setNewIntegrationData(newData);

    if (newIntegrationTypeId) {
      const selectedIntegration = integrations?.find(
        (i) => i._id === newIntegrationTypeId
      );
      if (selectedIntegration) {
        validateIntegrationDataField(
          fieldName,
          value,
          selectedIntegration.required_data || []
        );
      }
    }
  };

  const handleCreateOwnerIntegration = async () => {
    if (!newIntegrationLabel.trim() || !newIntegrationTypeId) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    const selectedIntegration = integrations?.find(
      (i) => i._id === newIntegrationTypeId
    );
    if (selectedIntegration) {
      if (
        !validateAllIntegrationData(selectedIntegration.required_data || [])
      ) {
        setSubmitError("Please fill in all required integration data fields");
        return;
      }
    }

    if (!address) {
      setSubmitError("Wallet address not available");
      return;
    }

    setIsCreatingIntegration(true);
    setSubmitError("");

    let signature: string;
    try {
      signature = await signMessage(CREATE_OWNER_INTEGRATION_SIGN_MESSAGE);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to sign message. Please try again."
      );
      setIsCreatingIntegration(false);
      return;
    }

    try {
      const newOwnerIntegrationId = await createOwnerIntegration({
        label: newIntegrationLabel.trim(),
        integration_id: newIntegrationTypeId as Id<"integrations">,
        data: newIntegrationData,
        owner: address,
        signature,
      });

      // Add the newly created integration to selected list
      setSelectedOwnerIntegrationIds([
        ...selectedOwnerIntegrationIds,
        newOwnerIntegrationId,
      ]);

      // Reset form
      setShowCreateIntegration(false);
      setNewIntegrationLabel("");
      setNewIntegrationTypeId("");
      setNewIntegrationData({});
      setNewIntegrationDataErrors({});
      setSubmitSuccess("Integration created successfully!");
      setTimeout(() => setSubmitSuccess(""), 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create integration"
      );
    } finally {
      setIsCreatingIntegration(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!chainId || !contractAddress || !eventAbi) {
      setSubmitError("Please fill in all required fields");
      return;
    }

    if (selectedOwnerIntegrationIds.length === 0) {
      setSubmitError("Please select at least one integration");
      return;
    }

    if (!validateAbi(eventAbi)) {
      setSubmitError("Please fix the ABI event error");
      return;
    }

    if (!validateAddress(contractAddress)) {
      setSubmitError("Please fix the contract address error");
      return;
    }

    let signature: string;

    try {
      signature = await signMessage(CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE);

      if (!address) {
        throw new Error("Wallet address not available");
      }
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to sign message. Please try again."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await createEventWatcher({
        chain_convex_id: chainId as Id<"chains">,
        contract_address: contractAddress.trim(),
        event_abi: eventAbi.trim(),
        owner_integration_ids: selectedOwnerIntegrationIds,
        owner: address,
        signature,
        condition: conditions.filter(
          (c) => c.field && c.operator && c.value.trim()
        ),
      });

      setSubmitSuccess("Successfully created event watcher!");
      // Reset form
      setChainId("");
      setContractAddress("");
      setEventAbi("");
      setSelectedOwnerIntegrationIds([]);
      setConditions([]);
      setSelectedEvent(null);
      setSelectedEventIndex("");
      setSelectedTemplate("");
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create event watcher"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (
    chains === undefined ||
    integrations === undefined ||
    ownerIntegrations === undefined
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={12}
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Spinner size="xl" color="blue.400" />
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box
        maxW="600px"
        margin="0 auto"
        padding={8}
        textAlign="center"
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Heading as="h1" size="xl" marginBottom={4} color="white">
          Connect Your Wallet
        </Heading>
        <Text color="gray.400">
          Please connect your wallet to create event subscriptions.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="800px"
      margin="0 auto"
      padding={8}
      borderRadius="lg"
      backgroundColor="gray.800"
      borderWidth="1px"
      borderColor="gray.700"
    >
      <Heading as="h1" size="xl" marginBottom={8} color="white">
        Create Event Subscription
      </Heading>

      <form onSubmit={handleSubmit}>
        <Stack gap={4}>
          {/* Template Selection */}
          <Box>
            <Text
              as="label"
              display="block"
              marginBottom={2}
              fontWeight="medium"
              color="gray.300"
            >
              Select from Templates (Optional)
            </Text>
            <NativeSelectRoot marginBottom={2}>
              <NativeSelectField
                value={selectedTemplate}
                onChange={(e) => {
                  const templateIndex = e.target.value;
                  setSelectedTemplate(templateIndex);

                  if (templateIndex === "") {
                    // Clear fields if no template selected
                    setChainId("");
                    setContractAddress("");
                    setEventAbi("");
                    setSelectedEvent(null);
                    setSelectedEventIndex("");
                    setConditions([]);
                    setAvailableEvents([]);
                    return;
                  }

                  const template = READY_EVENTS[parseInt(templateIndex, 10)];
                  if (!template) return;

                  // Find chain by chain_id
                  const matchingChain = chains?.find(
                    (c) => c.chain_id === template.chain_id
                  );

                  if (matchingChain) {
                    setChainId(matchingChain._id);
                  }

                  setContractAddress(template.contract_address);
                  setEventAbi(template.event_abi);
                  validateAbi(template.event_abi);
                  validateAddress(template.contract_address);

                  // Reset event selection and conditions
                  // Events will be fetched automatically via useEffect
                  // and then auto-selected via the other useEffect
                  setSelectedEvent(null);
                  setSelectedEventIndex("");
                  setConditions([]);
                  setUseManualEntry(false);
                  // Don't clear availableEvents here - let them be fetched
                }}
                borderColor="gray.700"
                backgroundColor="gray.900"
                color="white"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              >
                <option value="">Select a template (or fill manually)</option>
                {READY_EVENTS.map((template, index) => (
                  <option key={index} value={index.toString()}>
                    {template.protocol} - {template.description}
                  </option>
                ))}
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>

            {selectedTemplate !== "" &&
              READY_EVENTS[parseInt(selectedTemplate, 10)] && (
                <Box
                  padding={4}
                  borderRadius="md"
                  backgroundColor="gray.900"
                  borderWidth="1px"
                  borderColor="blue.500"
                  marginTop={2}
                >
                  <VStack alignItems="flex-start" gap={2}>
                    <HStack gap={2}>
                      <Text fontWeight="semibold" color="blue.400">
                        Protocol:
                      </Text>
                      <Text color="white">
                        {READY_EVENTS[parseInt(selectedTemplate, 10)].protocol}
                      </Text>
                    </HStack>
                    <HStack gap={2}>
                      <Text fontWeight="semibold" color="blue.400">
                        Description:
                      </Text>
                      <Text color="gray.300">
                        {
                          READY_EVENTS[parseInt(selectedTemplate, 10)]
                            .description
                        }
                      </Text>
                    </HStack>
                  </VStack>
                </Box>
              )}
          </Box>

          <Box>
            <Text
              as="label"
              display="block"
              marginBottom={2}
              fontWeight="medium"
              color="gray.300"
            >
              Chain *
            </Text>
            <NativeSelectRoot>
              <NativeSelectField
                value={chainId}
                onChange={(e) => {
                  setChainId(e.target.value as Id<"chains">);
                  // Clear template selection if user manually changes chain
                  if (selectedTemplate !== "") {
                    setSelectedTemplate("");
                  }
                }}
                borderColor="gray.700"
                backgroundColor="gray.900"
                color="white"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              >
                <option value="">Select a chain</option>
                {chains.map((chain) => (
                  <option key={chain._id} value={chain._id}>
                    {chain.name} (Chain ID: {chain.chain_id})
                  </option>
                ))}
              </NativeSelectField>
              <NativeSelectIndicator />
            </NativeSelectRoot>
          </Box>

          <Box>
            <Text
              as="label"
              display="block"
              marginBottom={2}
              fontWeight="medium"
              color="gray.300"
            >
              Contract Address *
            </Text>
            <Input
              type="text"
              value={contractAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0x..."
              required
              borderColor={addressError ? "red.500" : "gray.700"}
              backgroundColor="gray.900"
              color="white"
              _focus={{
                borderColor: addressError ? "red.500" : "blue.500",
                boxShadow: addressError
                  ? "0 0 0 1px var(--chakra-colors-red-500)"
                  : "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
            />
            {addressError && (
              <Text color="red.400" fontSize="sm" marginTop={1}>
                {addressError}
              </Text>
            )}
          </Box>

          <Box>
            <Text
              as="label"
              display="block"
              marginBottom={2}
              fontWeight="medium"
              color="gray.300"
            >
              Event ABI *
            </Text>

            {/* Show message when contract address is not filled */}
            {(!contractAddress.trim() ||
              !isAddress(contractAddress.trim()) ||
              !chainId) && (
              <Box
                padding={4}
                borderRadius="md"
                backgroundColor="gray.900"
                borderWidth="1px"
                borderColor="gray.700"
              >
                <Text color="gray.400" fontSize="sm">
                  Please fill in the contract address and select a chain first
                  to automatically fetch available events.
                </Text>
              </Box>
            )}

            {/* Show loading state when fetching events */}
            {isFetchingEvents &&
              contractAddress.trim() &&
              isAddress(contractAddress.trim()) &&
              chainId && (
                <Box
                  padding={4}
                  borderRadius="md"
                  backgroundColor="gray.900"
                  borderWidth="1px"
                  borderColor="gray.700"
                  display="flex"
                  alignItems="center"
                  gap={3}
                >
                  <Spinner size="sm" color="blue.400" />
                  <Text color="gray.400" fontSize="sm">
                    Fetching available events from contract...
                  </Text>
                </Box>
              )}

            {/* Show dropdown when events are available */}
            {!isFetchingEvents &&
              !useManualEntry &&
              availableEvents.length > 0 &&
              contractAddress.trim() &&
              isAddress(contractAddress.trim()) &&
              chainId && (
                <Box>
                  <NativeSelectRoot marginBottom={2}>
                    <NativeSelectField
                      value={selectedEventIndex}
                      onChange={(e) => handleEventSelect(e.target.value)}
                      placeholder="Select an event from the contract"
                      borderColor="gray.700"
                      backgroundColor="gray.900"
                      color="white"
                      _focus={{
                        borderColor: "blue.500",
                        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                      }}
                    >
                      <option value="">
                        Select an event from the contract
                      </option>
                      {availableEvents.map((event, index) => {
                        const name = event.name || "Unknown";
                        const inputs = event.inputs || [];
                        const inputString = inputs
                          .map((input: any) => {
                            const indexed = input.indexed ? " indexed" : "";
                            return `${input.type}${indexed} ${input.name || ""}`;
                          })
                          .join(", ");
                        return (
                          <option key={index} value={index.toString()}>
                            {name}({inputString})
                          </option>
                        );
                      })}
                    </NativeSelectField>
                    <NativeSelectIndicator />
                  </NativeSelectRoot>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    color="gray.400"
                    onClick={() => {
                      setUseManualEntry(true);
                      setSelectedEventIndex("");
                      setEventAbi("");
                    }}
                    _hover={{ color: "blue.400" }}
                  >
                    Or enter manually
                  </Button>
                </Box>
              )}

            {/* Show error and manual entry option */}
            {eventsFetchError && !useManualEntry && (
              <Box
                padding={4}
                borderRadius="md"
                backgroundColor="rgba(239, 68, 68, 0.1)"
                borderWidth="1px"
                borderColor="red.500"
                marginBottom={2}
              >
                <Text color="red.400" fontSize="sm" marginBottom={2}>
                  {eventsFetchError}
                </Text>
                <Button
                  type="button"
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  onClick={() => setUseManualEntry(true)}
                >
                  Enter event manually
                </Button>
              </Box>
            )}

            {/* Show manual entry textarea when user chooses manual or API fails */}
            {useManualEntry && (
              <Box>
                <Textarea
                  value={eventAbi}
                  onChange={(e) => handleAbiChange(e.target.value)}
                  placeholder="event Mint(address indexed from, address indexed to, uint256 amount, uint256 timestamp)"
                  rows={3}
                  fontFamily="mono"
                  borderColor={abiError ? "red.500" : "gray.700"}
                  backgroundColor="gray.900"
                  color="white"
                  _focus={{
                    borderColor: abiError ? "red.500" : "blue.500",
                    boxShadow: abiError
                      ? "0 0 0 1px var(--chakra-colors-red-500)"
                      : "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
                {abiError && (
                  <Text color="red.400" fontSize="sm" marginTop={1}>
                    {abiError}
                  </Text>
                )}
              </Box>
            )}
          </Box>

          {/* Conditions Section */}
          {selectedEvent &&
            selectedEvent.inputs &&
            selectedEvent.inputs.length > 0 && (
              <Box>
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom={3}
                >
                  <Text
                    as="label"
                    display="block"
                    fontWeight="medium"
                    color="gray.300"
                  >
                    Conditions (Optional)
                  </Text>
                  <Button
                    type="button"
                    size="sm"
                    colorScheme="blue"
                    onClick={addCondition}
                    backgroundColor="blue.500"
                    color="white"
                    _hover={{ backgroundColor: "blue.600" }}
                  >
                    + Add Condition
                  </Button>
                </HStack>
                <Text fontSize="sm" color="gray.400" marginBottom={3}>
                  Add conditions to filter when you receive notifications for
                  this event.
                </Text>
                {conditions.length > 0 && (
                  <VStack gap={3} alignItems="stretch">
                    {conditions.map((condition, index) => {
                      const eventInput = selectedEvent.inputs.find(
                        (input: any) => input.name === condition.field
                      );
                      const operators = eventInput
                        ? getOperatorsForType(eventInput.type)
                        : ["==", "!="];
                      const isAddressType = eventInput?.type === "address";
                      const isUintType =
                        eventInput?.type.startsWith("uint") ||
                        eventInput?.type.startsWith("int");

                      return (
                        <Box
                          key={index}
                          padding={4}
                          borderRadius="md"
                          backgroundColor="gray.900"
                          borderWidth="1px"
                          borderColor="gray.700"
                        >
                          <HStack gap={3} alignItems="flex-start">
                            <Box flex={1}>
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                marginBottom={1}
                              >
                                Field
                              </Text>
                              <NativeSelectRoot>
                                <NativeSelectField
                                  value={condition.field}
                                  onChange={(e) =>
                                    updateCondition(
                                      index,
                                      "field",
                                      e.target.value
                                    )
                                  }
                                  borderColor="gray.700"
                                  backgroundColor="gray.800"
                                  color="white"
                                  _focus={{
                                    borderColor: "blue.500",
                                    boxShadow:
                                      "0 0 0 1px var(--chakra-colors-blue-500)",
                                  }}
                                >
                                  <option value="">Select field</option>
                                  {selectedEvent.inputs.map((input: any) => (
                                    <option
                                      key={input.name}
                                      value={input.name || ""}
                                    >
                                      {input.name || "unnamed"} ({input.type})
                                    </option>
                                  ))}
                                </NativeSelectField>
                                <NativeSelectIndicator />
                              </NativeSelectRoot>
                            </Box>

                            <Box flex={1}>
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                marginBottom={1}
                              >
                                Operator
                              </Text>
                              <NativeSelectRoot>
                                <NativeSelectField
                                  value={condition.operator}
                                  onChange={(e) =>
                                    updateCondition(
                                      index,
                                      "operator",
                                      e.target.value
                                    )
                                  }
                                  borderColor="gray.700"
                                  backgroundColor="gray.800"
                                  color="white"
                                  _focus={{
                                    borderColor: "blue.500",
                                    boxShadow:
                                      "0 0 0 1px var(--chakra-colors-blue-500)",
                                  }}
                                >
                                  {operators.map((op) => (
                                    <option key={op} value={op}>
                                      {op === "=="
                                        ? "equals"
                                        : op === "!="
                                          ? "not equals"
                                          : op === ">"
                                            ? "greater than"
                                            : op === ">="
                                              ? "greater than or equal"
                                              : op === "<"
                                                ? "less than"
                                                : "less than or equal"}
                                    </option>
                                  ))}
                                </NativeSelectField>
                                <NativeSelectIndicator />
                              </NativeSelectRoot>
                            </Box>

                            <Box flex={1}>
                              <Text
                                fontSize="xs"
                                color="gray.400"
                                marginBottom={1}
                              >
                                Value
                              </Text>
                              <Input
                                value={condition.value}
                                onChange={(e) =>
                                  updateCondition(
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                placeholder={
                                  isAddressType
                                    ? "0x..."
                                    : isUintType
                                      ? "123"
                                      : "value"
                                }
                                borderColor="gray.700"
                                backgroundColor="gray.800"
                                color="white"
                                fontFamily={isAddressType ? "mono" : "inherit"}
                                _focus={{
                                  borderColor: "blue.500",
                                  boxShadow:
                                    "0 0 0 1px var(--chakra-colors-blue-500)",
                                }}
                              />
                            </Box>

                            <Button
                              type="button"
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => removeCondition(index)}
                              marginTop={6}
                              _hover={{ backgroundColor: "red.900" }}
                            >
                              Remove
                            </Button>
                          </HStack>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
                {conditions.length === 0 && (
                  <Box
                    padding={4}
                    borderRadius="md"
                    backgroundColor="gray.900"
                    borderWidth="1px"
                    borderColor="gray.700"
                    textAlign="center"
                  >
                    <Text color="gray.400" fontSize="sm">
                      No conditions added. You will receive notifications for
                      all events matching this signature.
                    </Text>
                  </Box>
                )}
              </Box>
            )}

          <Box>
            <Text
              as="label"
              display="block"
              marginBottom={2}
              fontWeight="medium"
              color="gray.300"
            >
              Integrations *
            </Text>
            {ownerIntegrations.length === 0 && !showCreateIntegration ? (
              <Box
                padding={4}
                borderRadius="md"
                backgroundColor="gray.900"
                borderWidth="1px"
                borderColor="gray.700"
                marginBottom={4}
              >
                <Text color="gray.400" marginBottom={3}>
                  You don't have any integrations yet. Create one to get
                  started.
                </Text>
                <Button
                  type="button"
                  colorPalette="blue"
                  size="sm"
                  onClick={() => setShowCreateIntegration(true)}
                  backgroundColor="blue.500"
                  color="white"
                  _hover={{ backgroundColor: "blue.600" }}
                >
                  Create Integration
                </Button>
              </Box>
            ) : (
              <>
                <Box
                  padding={3}
                  borderRadius="md"
                  backgroundColor="gray.900"
                  borderWidth="1px"
                  borderColor="gray.700"
                  marginBottom={3}
                >
                  <Stack gap={2}>
                    {ownerIntegrations.map((ownerIntegration) => {
                      const integration = integrations?.find(
                        (i) => i._id === ownerIntegration.integration_id
                      );
                      const isSelected = selectedOwnerIntegrationIds.includes(
                        ownerIntegration._id
                      );
                      return (
                        <Box
                          key={ownerIntegration._id}
                          display="flex"
                          alignItems="center"
                          padding={2}
                          borderRadius="md"
                          backgroundColor={
                            isSelected ? "blue.900" : "transparent"
                          }
                          borderWidth="1px"
                          borderColor={isSelected ? "blue.500" : "gray.700"}
                          cursor="pointer"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedOwnerIntegrationIds(
                                selectedOwnerIntegrationIds.filter(
                                  (id) => id !== ownerIntegration._id
                                )
                              );
                            } else {
                              setSelectedOwnerIntegrationIds([
                                ...selectedOwnerIntegrationIds,
                                ownerIntegration._id,
                              ]);
                            }
                          }}
                          _hover={{
                            backgroundColor: isSelected
                              ? "blue.800"
                              : "gray.800",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setSelectedOwnerIntegrationIds(
                                  selectedOwnerIntegrationIds.filter(
                                    (id) => id !== ownerIntegration._id
                                  )
                                );
                              } else {
                                setSelectedOwnerIntegrationIds([
                                  ...selectedOwnerIntegrationIds,
                                  ownerIntegration._id,
                                ]);
                              }
                            }}
                            style={{
                              marginRight: "12px",
                              cursor: "pointer",
                            }}
                          />
                          <Box flex={1}>
                            <Text
                              fontWeight="medium"
                              color="white"
                              fontSize="sm"
                            >
                              {ownerIntegration.label}
                            </Text>
                            <Text color="gray.400" fontSize="xs">
                              {integration?.name || "Unknown"}
                            </Text>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
                <Button
                  type="button"
                  colorPalette="gray"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCreateIntegration(true)}
                  marginBottom={4}
                >
                  + Add New Integration
                </Button>
              </>
            )}

            {showCreateIntegration && (
              <Box
                padding={4}
                borderRadius="md"
                backgroundColor="gray.900"
                borderWidth="1px"
                borderColor="gray.700"
                marginTop={4}
              >
                <Text
                  fontWeight="medium"
                  color="gray.300"
                  marginBottom={4}
                  fontSize="lg"
                >
                  Create New Integration
                </Text>
                <Stack gap={4}>
                  <Box>
                    <Text
                      as="label"
                      display="block"
                      marginBottom={2}
                      fontWeight="medium"
                      color="gray.300"
                    >
                      Label *
                    </Text>
                    <Input
                      type="text"
                      value={newIntegrationLabel}
                      onChange={(e) => setNewIntegrationLabel(e.target.value)}
                      placeholder="e.g., My Telegram Group"
                      required
                      borderColor="gray.700"
                      backgroundColor="gray.800"
                      color="white"
                    />
                  </Box>

                  <Box>
                    <Text
                      as="label"
                      display="block"
                      marginBottom={2}
                      fontWeight="medium"
                      color="gray.300"
                    >
                      Integration Type *
                    </Text>
                    <NativeSelectRoot>
                      <NativeSelectField
                        value={newIntegrationTypeId}
                        onChange={(e) =>
                          handleIntegrationTypeChange(
                            e.target.value as Id<"integrations">
                          )
                        }
                        placeholder="Select integration type"
                        borderColor="gray.700"
                        backgroundColor="gray.900"
                        color="white"
                        _focus={{
                          borderColor: "blue.500",
                          boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                        }}
                      >
                        <option value="">Select integration type</option>
                        {integrations?.map((integration) => (
                          <option key={integration._id} value={integration._id}>
                            {integration.name}
                          </option>
                        ))}
                      </NativeSelectField>
                      <NativeSelectIndicator />
                    </NativeSelectRoot>
                  </Box>

                  {newIntegrationTypeId &&
                    (() => {
                      const selectedIntegration = integrations?.find(
                        (i) => i._id === newIntegrationTypeId
                      );
                      const requiredFields =
                        selectedIntegration?.required_data || [];

                      if (requiredFields.length > 0) {
                        return (
                          <Box>
                            <Text
                              as="label"
                              display="block"
                              marginBottom={4}
                              fontWeight="medium"
                              color="gray.300"
                              fontSize="md"
                            >
                              Configuration
                            </Text>
                            <Stack gap={4}>
                              {requiredFields.map((field) => (
                                <Box key={field}>
                                  <Text
                                    as="label"
                                    display="block"
                                    marginBottom={2}
                                    fontWeight="medium"
                                    color="gray.300"
                                  >
                                    {field.charAt(0).toUpperCase() +
                                      field.slice(1)}{" "}
                                    *
                                  </Text>
                                  <Input
                                    type="text"
                                    value={newIntegrationData[field] || ""}
                                    onChange={(e) =>
                                      handleIntegrationDataFieldChange(
                                        field,
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Enter ${field}`}
                                    required
                                    borderColor={
                                      newIntegrationDataErrors[field]
                                        ? "red.500"
                                        : "gray.700"
                                    }
                                    backgroundColor="gray.800"
                                    color="white"
                                    _focus={{
                                      borderColor: newIntegrationDataErrors[
                                        field
                                      ]
                                        ? "red.500"
                                        : "blue.500",
                                      boxShadow: newIntegrationDataErrors[field]
                                        ? "0 0 0 1px var(--chakra-colors-red-500)"
                                        : "0 0 0 1px var(--chakra-colors-blue-500)",
                                    }}
                                  />
                                  {newIntegrationDataErrors[field] && (
                                    <Text
                                      color="red.400"
                                      fontSize="sm"
                                      marginTop={1}
                                    >
                                      {newIntegrationDataErrors[field]}
                                    </Text>
                                  )}
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        );
                      }
                      return null;
                    })()}

                  <Box display="flex" gap={2}>
                    <Button
                      type="button"
                      colorPalette="blue"
                      size="sm"
                      onClick={handleCreateOwnerIntegration}
                      loading={isSigning || isCreatingIntegration}
                      loadingText={isSigning ? "Signing..." : "Creating..."}
                      backgroundColor="blue.500"
                      color="white"
                      _hover={{ backgroundColor: "blue.600" }}
                    >
                      Create Integration
                    </Button>
                    <Button
                      type="button"
                      colorPalette="gray"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowCreateIntegration(false);
                        setNewIntegrationLabel("");
                        setNewIntegrationTypeId("");
                        setNewIntegrationData({});
                        setNewIntegrationDataErrors({});
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Stack>
              </Box>
            )}
          </Box>

          {submitError && (
            <Box
              padding={4}
              borderRadius="md"
              backgroundColor="rgba(239, 68, 68, 0.1)"
              borderColor="red.500"
              borderWidth="1px"
            >
              <Text color="red.400">{submitError}</Text>
            </Box>
          )}

          {submitSuccess && (
            <Box
              padding={4}
              borderRadius="md"
              backgroundColor="rgba(34, 197, 94, 0.1)"
              borderColor="green.500"
              borderWidth="1px"
            >
              <Text color="green.400">{submitSuccess}</Text>
            </Box>
          )}

          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            loading={isSigning || isSubmitting}
            loadingText={isSigning ? "Signing message..." : "Creating..."}
            width="100%"
            backgroundColor="blue.500"
            color="white"
            _hover={{ backgroundColor: "blue.600" }}
          >
            Create Event Subscription
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
