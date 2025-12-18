"use client";

import { useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { parseAbiItem, isAddress } from "viem";
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
import { mainnetViemClient } from "../../../convex/viem";
import { useWallet } from "../providers/WalletContext";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../constants";

export function EventSubscriptionForm() {
  const { isConnected, address, signMessage, isSigning } = useWallet();

  const [chainId, setChainId] = useState<Id<"chains"> | "">("");
  const [contractAddress, setContractAddress] = useState("");
  const [eventAbi, setEventAbi] = useState("");
  const [taskDefinitionId, setTaskDefinitionId] = useState<
    Id<"task_definitions"> | ""
  >("");

  const [taskData, setTaskData] = useState<Record<string, string>>({});
  const [taskDataErrors, setTaskDataErrors] = useState<Record<string, string>>(
    {}
  );
  const [abiError, setAbiError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const chains = useQuery(api.chains.getChains);
  const taskDefinitions = useQuery(api.taskDefinitions.getTaskDefinitions);

  const subscribeToEvent = useAction(api.user.subscribeToEvent);

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

  const validateTaskDataField = (
    fieldName: string,
    value: string,
    requiredFields: string[]
  ) => {
    const errors: Record<string, string> = { ...taskDataErrors };

    if (requiredFields.includes(fieldName)) {
      if (!value.trim()) {
        errors[fieldName] = "This field is required";
      } else {
        delete errors[fieldName];
      }
    } else {
      delete errors[fieldName];
    }

    setTaskDataErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAllTaskData = (requiredFields: string[]) => {
    if (requiredFields.length === 0) {
      return true;
    }

    const errors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!taskData[field] || !taskData[field].trim()) {
        errors[field] = "This field is required";
        isValid = false;
      }
    });

    setTaskDataErrors(errors);
    return isValid;
  };

  const handleTaskDefinitionChange = (value: Id<"task_definitions"> | "") => {
    setTaskDefinitionId(value);
    // Reset task data when changing task definition
    setTaskData({});
    setTaskDataErrors({});
  };

  const handleTaskDataFieldChange = (fieldName: string, value: string) => {
    const newTaskData = { ...taskData, [fieldName]: value };
    setTaskData(newTaskData);

    if (taskDefinitionId) {
      const selectedTaskDef = taskDefinitions?.find(
        (td) => td._id === taskDefinitionId
      );
      if (selectedTaskDef) {
        validateTaskDataField(
          fieldName,
          value,
          selectedTaskDef.required_data || []
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!chainId || !contractAddress || !eventAbi || !taskDefinitionId) {
      setSubmitError("Please fill in all required fields");
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

    // Validate task data against required fields
    const selectedTaskDef = taskDefinitions?.find(
      (td) => td._id === taskDefinitionId
    );
    if (selectedTaskDef) {
      if (!validateAllTaskData(selectedTaskDef.required_data || [])) {
        setSubmitError("Please fill in all required task data fields");
        return;
      }
    }

    // Use taskData object directly (it's already an object, not JSON string)
    const parsedTaskData = taskData;

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
      await subscribeToEvent({
        chain_id: chainId as Id<"chains">,
        contract_address: contractAddress.trim(),
        event_abi: eventAbi.trim(),
        task_definition_id: taskDefinitionId as Id<"task_definitions">,
        data: parsedTaskData,
        signature,
      });

      setSubmitSuccess("Successfully created event subscription and task!");
      // Reset form
      setChainId("");
      setContractAddress("");
      setEventAbi("");
      setTaskDefinitionId("");
      setTaskData({});
      setTaskDataErrors({});
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create event subscription"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (chains === undefined || taskDefinitions === undefined) {
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
              Task Definition *
            </Text>
            <select
              value={taskDefinitionId}
              onChange={(e) =>
                handleTaskDefinitionChange(
                  e.target.value as Id<"task_definitions">
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
              <option value="">Select a task definition</option>
              {taskDefinitions.map((taskDef) => (
                <option key={taskDef._id} value={taskDef._id}>
                  {taskDef.name}
                </option>
              ))}
            </select>
          </Box>

          {taskDefinitionId &&
            (() => {
              const selectedTaskDef = taskDefinitions?.find(
                (td) => td._id === taskDefinitionId
              );
              const requiredFields = selectedTaskDef?.required_data || [];

              if (requiredFields.length > 0) {
                return (
                  <Box>
                    <Text
                      as="label"
                      display="block"
                      marginBottom={4}
                      fontWeight="medium"
                      color="gray.300"
                      fontSize="lg"
                    >
                      Task Configuration
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
                            {field.charAt(0).toUpperCase() + field.slice(1)} *
                          </Text>
                          <Input
                            type="text"
                            value={taskData[field] || ""}
                            onChange={(e) =>
                              handleTaskDataFieldChange(field, e.target.value)
                            }
                            placeholder={`Enter ${field}`}
                            required
                            borderColor={
                              taskDataErrors[field] ? "red.500" : "gray.700"
                            }
                            backgroundColor="gray.900"
                            color="white"
                            _focus={{
                              borderColor: taskDataErrors[field]
                                ? "red.500"
                                : "blue.500",
                              boxShadow: taskDataErrors[field]
                                ? "0 0 0 1px var(--chakra-colors-red-500)"
                                : "0 0 0 1px var(--chakra-colors-blue-500)",
                            }}
                          />
                          {taskDataErrors[field] && (
                            <Text color="red.400" fontSize="sm" marginTop={1}>
                              {taskDataErrors[field]}
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
