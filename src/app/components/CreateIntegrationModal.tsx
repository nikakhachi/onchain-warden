"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { getAddress } from "viem";
import {
  Box,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  FieldRoot,
  FieldLabel,
  FieldErrorText,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  NativeSelectRoot,
  NativeSelectField,
  NativeSelectIndicator,
} from "@chakra-ui/react";
import { useWallet } from "../providers/WalletContext";
import { CREATE_OWNER_INTEGRATION_SIGN_MESSAGE } from "../constants";
import { Button } from "./Button";

interface CreateIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateIntegrationModal({
  isOpen,
  onClose,
}: CreateIntegrationModalProps) {
  const { address, signMessage, isSigning } = useWallet();

  const [label, setLabel] = useState("");
  const [integrationTypeId, setIntegrationTypeId] = useState<
    Id<"integrations"> | ""
  >("");
  const [integrationData, setIntegrationData] = useState<
    Record<string, string>
  >({});
  const [dataErrors, setDataErrors] = useState<Record<string, string>>({});
  const [labelError, setLabelError] = useState("");
  const [typeError, setTypeError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const integrations = useQuery(api.integrations.getIntegrations);
  const createOwnerIntegration = useAction(
    api.ownerIntegrations.createOwnerIntegrationAction
  );

  const selectedIntegration = integrations?.find(
    (i) => i._id === integrationTypeId
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
    if (!address) {
      alert("Error: Wallet not connected.");
      return;
    }

    let isValid = true;
    if (!label.trim()) {
      setLabelError("Label is required");
      isValid = false;
    } else {
      setLabelError("");
    }

    if (!integrationTypeId) {
      setTypeError("Integration type is required");
      isValid = false;
    } else {
      setTypeError("");
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

      await createOwnerIntegration({
        label: label.trim(),
        integration_id: integrationTypeId as Id<"integrations">,
        data: integrationData,
        owner: address,
        signature,
      });

      alert("Success: Integration created successfully!");

      // Reset form
      setLabel("");
      setIntegrationTypeId("");
      setIntegrationData({});
      setDataErrors({});
      setLabelError("");
      setTypeError("");
      onClose();
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Failed to create integration"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setLabel("");
    setIntegrationTypeId("");
    setIntegrationData({});
    setDataErrors({});
    setLabelError("");
    setTypeError("");
    onClose();
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
      <DialogBackdrop
        backgroundColor="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
      />
      <DialogPositioner>
        <DialogContent
          backgroundColor="gray.900"
          borderColor="gray.800"
          borderWidth="1px"
          color="white"
          maxW="600px"
        >
        <DialogHeader>
          <DialogTitle>Create Integration</DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <VStack gap={4} alignItems="stretch">
            <FieldRoot required invalid={!!labelError}>
              <FieldLabel color="gray.300">Integration Label</FieldLabel>
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
              {labelError && <FieldErrorText>{labelError}</FieldErrorText>}
            </FieldRoot>

            <FieldRoot required invalid={!!typeError}>
              <FieldLabel color="gray.300">Integration Type</FieldLabel>
              <NativeSelectRoot>
                <NativeSelectField
                  value={integrationTypeId}
                  onChange={(e) => {
                    setIntegrationTypeId(e.target.value as Id<"integrations">);
                    setIntegrationData({});
                    setDataErrors({});
                    setTypeError("");
                  }}
                  placeholder="Select an integration type"
                  borderColor={typeError ? "red.500" : "gray.700"}
                  backgroundColor="gray.900"
                  color="white"
                  _focus={{
                    borderColor: typeError ? "red.500" : "blue.500",
                    boxShadow: typeError
                      ? "0 0 0 1px var(--chakra-colors-red-500)"
                      : "0 0 0 1px var(--chakra-colors-blue-500)",
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
              {typeError && <FieldErrorText>{typeError}</FieldErrorText>}
            </FieldRoot>

            {selectedIntegration &&
              selectedIntegration.required_data.length > 0 && (
                <Box>
                  <Text color="gray.300" marginBottom={3}>
                    Required Fields for {selectedIntegration.name}:
                  </Text>
                  <VStack gap={3}>
                    {selectedIntegration.required_data.map((field) => (
                      <FieldRoot
                        key={field}
                        required
                        invalid={!!dataErrors[field]}
                      >
                        <FieldLabel color="gray.300">
                          {field.charAt(0).toUpperCase() + field.slice(1)}
                        </FieldLabel>
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
                          <FieldErrorText>{dataErrors[field]}</FieldErrorText>
                        )}
                      </FieldRoot>
                    ))}
                  </VStack>
                </Box>
              )}
          </VStack>
        </DialogBody>
        <DialogFooter>
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
            Create Integration
          </Button>
        </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  );
}
