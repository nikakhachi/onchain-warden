"use client";

import { useState } from "react";
import {
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
} from "@chakra-ui/react";
import { useUser } from "../../../providers/UserContext";
import { useToast } from "../../../providers/ToastContext";
import { Button } from "../../../components/Button";

interface CreateTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTeamDialog({ isOpen, onClose }: CreateTeamDialogProps) {
  const { error: showError, success: showSuccess } = useToast();
  const { createTeam } = useUser();
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateName = (teamName: string) => {
    if (!teamName.trim()) {
      setNameError("Team name is required");
      return false;
    }
    if (teamName.trim().length > 100) {
      setNameError("Team name must be 100 characters or less");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateName(name)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createTeam({ name: name.trim() });
      showSuccess("Team created successfully");
      setName("");
      setNameError("");
      onClose();
    } catch (error) {
      showError("Failed to create team");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName("");
    setNameError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white" maxW="500px">
        <ModalHeader position="relative" paddingBottom={4}>
          <HStack justifyContent="space-between" alignItems="flex-start" width="100%">
            <VStack alignItems="flex-start" gap={1} flex={1}>
              <Text fontSize="xl" fontWeight="bold" color="white">
                Create Team
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                Create a new team to organize your watchers and integrations
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <FormControl isInvalid={!!nameError}>
              <FormLabel color="gray.300">Team Name</FormLabel>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                placeholder="e.g., My Team"
                borderColor={nameError ? "red.500" : "gray.800"}
                backgroundColor="gray.950"
                color="white"
                _focus={{
                  borderColor: nameError ? "red.500" : "blue.500",
                  boxShadow: nameError
                    ? "0 0 0 1px var(--chakra-colors-red-500)"
                    : "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {nameError && <FormErrorMessage>{nameError}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={handleClose} marginRight={3}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            Create Team
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
