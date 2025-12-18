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

  const [taskData, setTaskData] = useState("{}");
  const [abiError, setAbiError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [taskDataError, setTaskDataError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const chains = useQuery(api.chains.getChains);
  const taskDefinitions = useQuery(api.taskDefinitions.getTaskDefinitions);

  const subscribeToEvent = useAction(api.subscribeToEvent.main);

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

  const validateTaskData = (data: string, requiredFields: string[]) => {
    if (requiredFields.length === 0) {
      setTaskDataError("");
      return true;
    }

    if (!data.trim()) {
      setTaskDataError("");
      return false;
    }

    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch (error) {
      setTaskDataError("Invalid JSON format");
      return false;
    }

    if (
      typeof parsedData !== "object" ||
      parsedData === null ||
      Array.isArray(parsedData)
    ) {
      setTaskDataError("Task data must be a JSON object");
      return false;
    }

    const providedFields = Object.keys(parsedData);
    const missingFields = requiredFields.filter(
      (field) => !providedFields.includes(field)
    );

    if (missingFields.length > 0) {
      setTaskDataError(`Missing required fields: ${missingFields.join(", ")}`);
      return false;
    }

    setTaskDataError("");
    return true;
  };

  const handleTaskDefinitionChange = (value: Id<"task_definitions"> | "") => {
    setTaskDefinitionId(value);
    // Reset task data when changing task definition
    setTaskData("{}");
    setTaskDataError("");

    // Validate current task data if a task definition is selected
    if (value) {
      const selectedTaskDef = taskDefinitions?.find((td) => td._id === value);
      if (selectedTaskDef) {
        validateTaskData(taskData, selectedTaskDef.required_data || []);
      }
    }
  };

  const handleTaskDataChange = (value: string) => {
    setTaskData(value);
    if (taskDefinitionId) {
      const selectedTaskDef = taskDefinitions?.find(
        (td) => td._id === taskDefinitionId
      );
      if (selectedTaskDef) {
        validateTaskData(value, selectedTaskDef.required_data || []);
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
      if (!validateTaskData(taskData, selectedTaskDef.required_data || [])) {
        setSubmitError("Please fix the task data error");
        return;
      }
    }

    let parsedTaskData;
    try {
      parsedTaskData = JSON.parse(taskData);
    } catch (error) {
      setSubmitError("Invalid JSON in task data");
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
      setTaskData("{}");
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
        minH="100vh"
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!isConnected) {
    return (
      <Box maxW="600px" margin="0 auto" padding={8} textAlign="center">
        <Heading as="h1" size="xl" marginBottom={4}>
          Connect Your Wallet
        </Heading>
        <Text color="gray.600">
          Please connect your wallet to create event subscriptions.
        </Text>
      </Box>
    );
  }

  return (
    <Box maxW="600px" margin="0 auto" padding={8}>
      <Heading as="h1" size="xl" marginBottom={6}>
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
            >
              Chain *
            </Text>
            <select
              value={chainId}
              onChange={(e) => setChainId(e.target.value as Id<"chains">)}
              required
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "6px",
                fontSize: "14px",
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
            >
              Contract Address *
            </Text>
            <Input
              type="text"
              value={contractAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0x..."
              required
              borderColor={addressError ? "red.500" : undefined}
            />
            {addressError && (
              <Text color="red.500" fontSize="sm" marginTop={1}>
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
            >
              Event ABI *
            </Text>
            <Textarea
              value={eventAbi}
              onChange={(e) => handleAbiChange(e.target.value)}
              placeholder="event Mint(address indexed from, address indexed to, uint256 amount, uint256 timestamp)"
              rows={3}
              fontFamily="mono"
              borderColor={abiError ? "red.500" : undefined}
            />
            {abiError && (
              <Text color="red.500" fontSize="sm" marginTop={1}>
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
                padding: "8px 12px",
                border: "1px solid",
                borderColor: "var(--chakra-colors-gray-300)",
                borderRadius: "6px",
                fontSize: "14px",
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

          <Box>
            <Text
              as="label"
              display="block"
              marginBottom={2}
              fontWeight="medium"
            >
              Task Data (JSON)
              {taskDefinitionId &&
                (() => {
                  const selectedTaskDef = taskDefinitions?.find(
                    (td) => td._id === taskDefinitionId
                  );
                  const requiredFields = selectedTaskDef?.required_data || [];
                  if (requiredFields.length > 0) {
                    return (
                      <Text
                        as="span"
                        color="gray.500"
                        fontWeight="normal"
                        fontSize="sm"
                        marginLeft={2}
                      >
                        (Required: {requiredFields.join(", ")})
                      </Text>
                    );
                  }
                  return null;
                })()}
            </Text>
            <Textarea
              value={taskData}
              onChange={(e) => handleTaskDataChange(e.target.value)}
              placeholder={
                taskDefinitionId
                  ? (() => {
                      const selectedTaskDef = taskDefinitions?.find(
                        (td) => td._id === taskDefinitionId
                      );
                      const requiredFields =
                        selectedTaskDef?.required_data || [];
                      if (requiredFields.length > 0) {
                        const placeholderObj: Record<string, string> = {};
                        requiredFields.forEach((field) => {
                          placeholderObj[field] = "";
                        });
                        return JSON.stringify(placeholderObj, null, 2);
                      }
                      return "{}";
                    })()
                  : '{"chatId": "123456789"}'
              }
              rows={4}
              fontFamily="mono"
              borderColor={taskDataError ? "red.500" : undefined}
            />
            {taskDataError && (
              <Text color="red.500" fontSize="sm" marginTop={1}>
                {taskDataError}
              </Text>
            )}
          </Box>

          {submitError && (
            <Box
              padding={3}
              borderRadius="md"
              backgroundColor="red.50"
              borderColor="red.200"
              borderWidth="1px"
            >
              <Text color="red.600">{submitError}</Text>
            </Box>
          )}

          {submitSuccess && (
            <Box
              padding={3}
              borderRadius="md"
              backgroundColor="green.50"
              borderColor="green.200"
              borderWidth="1px"
            >
              <Text color="green.600">{submitSuccess}</Text>
            </Box>
          )}

          <Button
            type="submit"
            colorPalette="blue"
            size="lg"
            loading={isSigning || isSubmitting}
            loadingText={isSigning ? "Signing message..." : "Creating..."}
            width="100%"
          >
            Create Event Subscription
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
