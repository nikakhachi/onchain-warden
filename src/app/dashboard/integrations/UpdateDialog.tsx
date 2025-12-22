"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  RadioGroup,
  Radio,
} from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { CREATE_OWNER_INTEGRATION_SIGN_MESSAGE } from "../../constants";
import { Button } from "../../components/Button";
import { IntegrationIcon } from "@/app/icons/IntegrationIcon";

interface UpdateIntegrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  integrationId: Id<"owner_integrations"> | null;
  initialLabel: string;
  initialIntegrationId: Id<"integrations">;
  initialData: Record<string, string>;
}

export function UpdateIntegrationDialog({
  isOpen,
  onClose,
  integrationId,
  initialLabel,
  initialIntegrationId,
  initialData,
}: UpdateIntegrationDialogProps) {
  const { address, signMessage, isSigning } = useWallet();

  const [label, setLabel] = useState(initialLabel);
  const [integrationData, setIntegrationData] =
    useState<Record<string, string>>(initialData);
  const [dataErrors, setDataErrors] = useState<Record<string, string>>({});
  const [labelError, setLabelError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const integrations = useQuery(api.integrations.getIntegrations);
  const updateOwnerIntegration = useAction(
    api.ownerIntegrations.updateOwnerIntegrationAction
  );

  // Update form when initial values change
  useEffect(() => {
    if (isOpen) {
      setLabel(initialLabel);
      setIntegrationData(initialData);
      setDataErrors({});
      setLabelError("");
    }
  }, [isOpen, initialLabel, initialData]);

  const selectedIntegration = integrations?.find(
    (i) => i._id === initialIntegrationId
  );

  const validateAllData = (requiredFields: string[]) => {
    const errors: Record<string, string> = {};
    let isValid = true;
    requiredFields.forEach((field) => {
      if (!integrationData[field] || !integrationData[field].trim()) {
        errors[field] = "This field is required";
        isValid = false;
      }
    });
    setDataErrors(errors);
    return isValid;
  };

  const handleDataFieldChange = (fieldName: string, value: string) => {
    const newData = { ...integrationData, [fieldName]: value };
    setIntegrationData(newData);
    if (selectedIntegration) {
      const errors = { ...dataErrors };
      if (selectedIntegration.required_data.includes(fieldName)) {
        if (!value.trim()) {
          errors[fieldName] = "This field is required";
        } else {
          delete errors[fieldName];
        }
      }
      setDataErrors(errors);
    }
  };

  const handleSubmit = async () => {
    if (!address || !integrationId) {
      alert("Error: Wallet not connected or integration ID missing.");
      return;
    }

    let isValid = true;
    if (!label.trim()) {
      setLabelError("Label is required");
      isValid = false;
    } else {
      setLabelError("");
    }

    if (selectedIntegration) {
      if (!validateAllData(selectedIntegration.required_data || [])) {
        isValid = false;
      }
    }

    if (!isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      let signature: string;
      try {
        signature = await signMessage(CREATE_OWNER_INTEGRATION_SIGN_MESSAGE);
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

      await updateOwnerIntegration({
        id: integrationId,
        label: label.trim(),
        data: integrationData,
        owner: address,
        signature,
      });

      // Reset form
      setLabel(initialLabel);
      setIntegrationData(initialData);
      setDataErrors({});
      setLabelError("");
      onClose();
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Failed to update integration"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLabel(initialLabel);
    setIntegrationData(initialData);
    setDataErrors({});
    setLabelError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay
        backgroundColor="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
      />
      <ModalContent
        backgroundColor="gray.900"
        borderColor="gray.800"
        borderWidth="1px"
        color="white"
        maxW="600px"
      >
        <ModalHeader position="relative" paddingBottom={4}>
          <HStack
            justifyContent="space-between"
            alignItems="flex-start"
            width="100%"
          >
            <VStack alignItems="flex-start" gap={1} flex={1}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                Update Integration
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                Update your integration settings
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <FormControl isRequired isInvalid={!!labelError}>
              <FormLabel color="gray.300">Integration Label</FormLabel>
              <Input
                value={label}
                onChange={(e) => {
                  setLabel(e.target.value);
                  setLabelError("");
                }}
                placeholder="e.g., My Telegram Bot"
                borderColor={labelError ? "red.500" : "gray.700"}
                backgroundColor="gray.900"
                color="white"
                _focus={{
                  borderColor: labelError ? "red.500" : "blue.500",
                  boxShadow: labelError
                    ? "0 0 0 1px var(--chakra-colors-red-500)"
                    : "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {labelError && <FormErrorMessage>{labelError}</FormErrorMessage>}
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300" marginBottom={3}>
                Integration Type
              </FormLabel>
              <RadioGroup
                value={initialIntegrationId}
                isDisabled
                colorScheme="blue"
              >
                <VStack gap={3} alignItems="stretch">
                  {integrations?.map((integration) => {
                    const isSelected = initialIntegrationId === integration._id;
                    return (
                      <Box
                        key={integration._id}
                        padding={4}
                        borderRadius="xl"
                        backgroundColor="gray.800"
                        borderWidth="2px"
                        borderColor={isSelected ? "blue.500" : "gray.700"}
                        opacity={isSelected ? 1 : 0.5}
                        width="100%"
                      >
                        <HStack gap={4} alignItems="center">
                          <Radio value={integration._id} isDisabled />
                          <Box width="24px" height="24px">
                            <IntegrationIcon name={integration.name} />
                          </Box>
                          <VStack alignItems="flex-start" gap={0} flex={1}>
                            <Text color="white" fontWeight="500" fontSize="sm">
                              {integration.name}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    );
                  })}
                </VStack>
              </RadioGroup>
              <Text color="gray.500" fontSize="xs" marginTop={2}>
                Integration type cannot be changed
              </Text>
            </FormControl>

            {selectedIntegration &&
              selectedIntegration.required_data.length > 0 && (
                <Box>
                  <Text color="gray.300" marginBottom={3}>
                    Required Fields for {selectedIntegration.name}:
                  </Text>
                  <VStack gap={3}>
                    {selectedIntegration.required_data.map((field) => (
                      <FormControl
                        key={field}
                        isRequired
                        isInvalid={!!dataErrors[field]}
                      >
                        <FormLabel color="gray.300">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </FormLabel>
                        <Input
                          value={integrationData[field] || ""}
                          onChange={(e) =>
                            handleDataFieldChange(field, e.target.value)
                          }
                          placeholder={`Enter ${field}`}
                          borderColor={
                            dataErrors[field] ? "red.500" : "gray.700"
                          }
                          backgroundColor="gray.900"
                          color="white"
                          _focus={{
                            borderColor: dataErrors[field]
                              ? "red.500"
                              : "blue.500",
                            boxShadow: dataErrors[field]
                              ? "0 0 0 1px var(--chakra-colors-red-500)"
                              : "0 0 0 1px var(--chakra-colors-blue-500)",
                          }}
                        />
                        {dataErrors[field] && (
                          <FormErrorMessage>
                            {dataErrors[field]}
                          </FormErrorMessage>
                        )}
                      </FormControl>
                    ))}
                  </VStack>
                </Box>
              )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            marginRight={3}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isSigning || isSubmitting}
          >
            Update Integration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
