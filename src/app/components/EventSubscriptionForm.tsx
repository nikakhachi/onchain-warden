"use client";

import { useState } from "react";
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
} from "@chakra-ui/react";
import { useWallet } from "../providers/WalletContext";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../constants";

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

  const chains = useQuery(api.chains.getChains);
  const integrations = useQuery(api.integrations.getIntegrations);
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    address ? { owner: address } : "skip"
  );

  const createOwnerIntegration = useMutation(
    api.ownerIntegrations.createOwnerIntegration
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

    try {
      const newOwnerIntegrationId = await createOwnerIntegration({
        label: newIntegrationLabel.trim(),
        integration_id: newIntegrationTypeId as Id<"integrations">,
        data: newIntegrationData,
        owner: getAddress(address),
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
        signature,
      });

      setSubmitSuccess("Successfully created event watcher!");
      // Reset form
      setChainId("");
      setContractAddress("");
      setEventAbi("");
      setSelectedOwnerIntegrationIds([]);
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
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value as Id<"chains">)}
              required
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid",
                borderColor: "#374151",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "#111827",
                color: "#f3f4f6",
              }}
            >
              <option value="">Select a chain</option>
              {chains.map((chain) => (
                <option key={chain._id} value={chain._id}>
                  {chain.name} (Chain ID: {chain.chain_id})
                </option>
              ))}
            </select>
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
                    <select
                      value={newIntegrationTypeId}
                      onChange={(e) =>
                        handleIntegrationTypeChange(
                          e.target.value as Id<"integrations">
                        )
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        border: "1px solid",
                        borderColor: "#374151",
                        borderRadius: "8px",
                        fontSize: "14px",
                        backgroundColor: "#111827",
                        color: "#f3f4f6",
                      }}
                    >
                      <option value="">Select integration type</option>
                      {integrations?.map((integration) => (
                        <option key={integration._id} value={integration._id}>
                          {integration.name}
                        </option>
                      ))}
                    </select>
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
                      loading={isCreatingIntegration}
                      loadingText="Creating..."
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
