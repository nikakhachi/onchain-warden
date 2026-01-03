"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react";
import { Button } from "../../components/Button";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Id } from "../../../../convex/_generated/dataModel";

interface EditTeamNameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: Id<"teams">;
  currentName: string;
}

export function EditTeamNameDialog({ isOpen, onClose, teamId, currentName }: EditTeamNameDialogProps) {
  const { editTeamName } = useUser();
  const { error: showError, success: showSuccess } = useToast();
  const [name, setName] = useState(currentName);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update name when currentName changes
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      showError("Team name cannot be empty");
      return;
    }

    if (name.trim() === currentName) {
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      await editTeamName({
        id: teamId,
        name: name.trim(),
      });

      showSuccess("Team name updated successfully");
      onClose();
    } catch (error: any) {
      showError(error.data || "Failed to update team name");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName(currentName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white">
        <ModalHeader>Edit Team Name</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <Text color="gray.400" fontSize="sm">
              Update the name of your team.
            </Text>

            <FormControl>
              <FormLabel color="gray.300" marginBottom={2}>
                Team Name
              </FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
                borderColor="gray.700"
                backgroundColor="gray.800"
                color="white"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                  }
                }}
              />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={handleClose} marginRight={3}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Updating..." : "Update Name"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
