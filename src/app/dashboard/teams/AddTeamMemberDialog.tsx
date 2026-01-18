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
  RadioGroup,
  Radio,
  HStack,
  Box,
} from "@chakra-ui/react";
import { Button } from "../../components/Button";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Id } from "../../../../convex/_generated/dataModel";
import { isAddress } from "viem";
import { GmailIcon } from "@/app/icons/GmailIcon";
import { WalletIcon } from "@/app/icons/WalletIcon";
import { validateEmail } from "@/app/shared/helpers";
import { RoleWithoutOwnerType } from "@/app/shared/types";

interface AddTeamMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: Id<"teams">;
}

export function AddTeamMemberDialog({ isOpen, onClose, teamId }: AddTeamMemberDialogProps) {
  const { addTeamMember } = useUser();
  const { error: showError, success: showSuccess } = useToast();
  const [searchType, setSearchType] = useState<"email" | "wallet">("email");
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState<RoleWithoutOwnerType>("member");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (searchType === "email") {
      if (!email.trim()) {
        showError("Please enter an email address");
        return;
      }

      if (!validateEmail(email.trim())) {
        showError("Invalid email format");
        return;
      }
    } else {
      if (!walletAddress.trim()) {
        showError("Please enter a wallet address");
        return;
      }

      if (!isAddress(walletAddress.trim())) {
        showError("Invalid wallet address format");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const args: {
        team_id: Id<"teams">;
        email?: string;
        wallet_address?: string;
        role: RoleWithoutOwnerType;
      } = {
        team_id: teamId,
        role,
      };

      if (searchType === "email") {
        args.email = email.trim();
      } else {
        args.wallet_address = walletAddress.trim();
      }

      await addTeamMember(args);

      showSuccess("Team member added successfully");
      setEmail("");
      setWalletAddress("");
      setRole("member");
      setSearchType("email");
      onClose();
    } catch (error: any) {
      showError(error.data || "Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setWalletAddress("");
    setRole("member");
    setSearchType("email");
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
              Enter the email or wallet address of the user you want to add to this team.
            </Text>

            <FormControl>
              <RadioGroup
                value={searchType}
                onChange={(value) => setSearchType(value as "email" | "wallet")}
                colorScheme="blue"
              >
                <HStack gap={3}>
                  <Box
                    as="button"
                    padding={3}
                    borderRadius="lg"
                    backgroundColor="gray.800"
                    borderWidth="2px"
                    borderColor={searchType === "email" ? "blue.500" : "gray.700"}
                    cursor="pointer"
                    onClick={() => setSearchType("email")}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: searchType === "email" ? "blue.500" : "gray.600",
                    }}
                    flex={1}
                  >
                    <HStack gap={2}>
                      <Radio value="email" />
                      <GmailIcon width="24px" height="24px" />
                      <Text color="white" fontSize="sm" fontWeight="500">
                        Gmail
                      </Text>
                    </HStack>
                  </Box>
                  <Box
                    as="button"
                    padding={3}
                    borderRadius="lg"
                    backgroundColor="gray.800"
                    borderWidth="2px"
                    borderColor={searchType === "wallet" ? "blue.500" : "gray.700"}
                    cursor="pointer"
                    onClick={() => setSearchType("wallet")}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: searchType === "wallet" ? "blue.500" : "gray.600",
                    }}
                    flex={1}
                  >
                    <HStack gap={2}>
                      <Radio value="wallet" />
                      <WalletIcon width="24px" height="24px" />
                      <Text color="white" fontSize="sm" fontWeight="500">
                        Wallet Address
                      </Text>
                    </HStack>
                  </Box>
                </HStack>
              </RadioGroup>
            </FormControl>

            {searchType === "email" ? (
              <FormControl>
                <FormLabel color="gray.300" marginBottom={2}>
                  Email Address
                </FormLabel>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  type="email"
                  borderColor="gray.700"
                  backgroundColor="gray.800"
                  color="white"
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                />
              </FormControl>
            ) : (
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
            )}

            <FormControl>
              <FormLabel color="gray.300" marginBottom={2}>
                Role
              </FormLabel>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as RoleWithoutOwnerType)}
                borderColor="gray.700"
                backgroundColor="gray.800"
                color="white"
                _focus={{
                  borderColor: "blue.500",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              >
                <option value="member">Member - Can manage alerts</option>
                <option value="admin">Admin - Can manage alerts and members</option>
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
