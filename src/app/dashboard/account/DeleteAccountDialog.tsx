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
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Button } from "../../components/Button";
import { useAuth } from "@/app/providers/AuthContext";
import { useRouter } from "next/navigation";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const { deleteUser } = useUser();
  const { error: showError, success: showSuccess } = useToast();
  const { logout } = useAuth();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  // Get teams where user is owner
  const { teams } = useUser();

  const ownerTeams = teams ? teams.filter((team) => team.role === "owner") : [];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteUser();
      showSuccess("Account deleted successfully");
      logout();
      router.push("/dashboard");
    } catch (error: any) {
      showError(error.data || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white" maxW="600px">
        <ModalHeader position="relative" paddingBottom={4}>
          <HStack justifyContent="space-between" alignItems="flex-start" width="100%">
            <VStack alignItems="flex-start" gap={1} flex={1}>
              <Text fontSize="xl" fontWeight="bold" color="red.400">
                Delete Account
              </Text>
              <Text color="gray.400" fontSize="sm" marginTop={0}>
                This action cannot be undone
              </Text>
            </VStack>
            <ModalCloseButton position="absolute" top={0} right={0} />
          </HStack>
        </ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <Text color="white" fontSize="md">
              Are you sure you want to delete your account? This will permanently delete:
            </Text>
            <Box backgroundColor="gray.800" borderRadius="md" padding={4} borderWidth="1px" borderColor="gray.700">
              <VStack gap={2} alignItems="stretch">
                <Text color="gray.300" fontSize="sm">
                  • Your account and all associated data
                </Text>
                {ownerTeams.length > 0 && (
                  <>
                    <Text color="red.400" fontSize="sm" fontWeight="semibold" marginTop={2}>
                      • All teams where you are the owner (including alerts and integrations):
                    </Text>
                    <Box paddingLeft={4}>
                      {ownerTeams.map((team) => (
                        <Text key={team!._id} color="gray.300" fontSize="sm">
                          - {team!.name}
                        </Text>
                      ))}
                    </Box>
                  </>
                )}
                <Text color="gray.300" fontSize="sm">
                  • All alerts and integrations in those teams
                </Text>
              </VStack>
            </Box>
            <Text color="red.400" fontSize="sm" fontWeight="semibold">
              This action is permanent and cannot be reversed.
            </Text>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="secondary" size="sm" onClick={onClose} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              backgroundColor="red.600"
              backgroundImage="none"
              color="white"
              _hover={{
                backgroundColor: "red.700",
                opacity: 1,
              }}
            >
              Delete Account
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
