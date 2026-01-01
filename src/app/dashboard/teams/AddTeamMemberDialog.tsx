"use client";

import { useState } from "react";
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
  Select,
  Text,
} from "@chakra-ui/react";
import { Button } from "../../components/Button";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Id } from "../../../../convex/_generated/dataModel";
import { isAddress } from "viem";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: Id<"teams">;
}

export function AddTeamMemberDialog({ isOpen, onClose, teamId }: AddTeamMemberDialogProps) {
  const { addTeamMember } = useUser();
  const { error: showError, success: showSuccess } = useToast();
  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!walletAddress.trim()) {
      showError("Please enter a wallet address");
      return;
    }

    if (!isAddress(walletAddress.trim())) {
      showError("Invalid wallet address format");
      return;
    }

    setIsSubmitting(true);

    try {
      await addTeamMember({
        team_id: teamId,
        wallet_address: walletAddress.trim(),
        role,
      });

      showSuccess("Team member added successfully");
      setWalletAddress("");
      setRole("member");
      onClose();
    } catch (error: any) {
      showError(error.message || "Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setWalletAddress("");
    setRole("member");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white">
        <ModalHeader>Add Team Member</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <Text color="gray.400" fontSize="sm">
              Enter the wallet address of the user you want to add to this team.
            </Text>

            <FormControl>
              <FormLabel color="gray.300" marginBottom={2}>
                Wallet Address
              </FormLabel>
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                borderColor="gray.700"
                backgroundColor="gray.800"
                color="white"
                fontFamily="mono"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.300" marginBottom={2}>
                Role
              </FormLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as "member" | "admin")}
                borderColor="gray.700"
                backgroundColor="gray.800"
                color="white"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              >
                <option value="member">Member - Can view and use watchers</option>
                <option value="admin">Admin - Can manage team members</option>
              </Select>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" size="sm" onClick={handleClose} marginRight={3}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Member"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

