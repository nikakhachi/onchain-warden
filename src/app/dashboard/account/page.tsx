"use client";

import { useState, useEffect } from "react";
import {
  Container,
  VStack,
  HStack,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Box,
  Input,
  Divider,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Button } from "../../components/Button";
import { useAuth } from "@/app/providers/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";
import { DeleteAccountDialog } from "./DeleteAccountDialog";
import { useMemo } from "react";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();
  const { updateUsername, teams, editTeamName } = useUser();
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [personalWorkspaceName, setPersonalWorkspaceName] = useState("");
  const [personalWorkspaceError, setPersonalWorkspaceError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingWorkspace, setIsSubmittingWorkspace] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { currentUser } = useAuth();

  const personalTeam = useMemo(() => teams?.find((t) => t.is_personal), [teams]);

  useEffect(() => {
    if (personalTeam) {
      setPersonalWorkspaceName(personalTeam.name);
    }
  }, [personalTeam]);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
    }
  }, [currentUser]);

  const validateUsername = (name: string) => {
    if (!name.trim()) {
      setUsernameError("Username is required");
      return false;
    }
    if (name.trim().length > 100) {
      setUsernameError("Username must be 100 characters or less");
      return false;
    }
    setUsernameError("");
    return true;
  };

  const validateWorkspaceName = (name: string) => {
    if (!name.trim()) {
      setPersonalWorkspaceError("Workspace name is required");
      return false;
    }

    setPersonalWorkspaceError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    if (!validateUsername(username)) {
      return;
    }

    if (username.trim() === currentUser.username) {
      return;
    }

    setIsSubmitting(true);

    try {
      await updateUsername({ username: username.trim() });
      showSuccess("Username updated successfully");
      setUsernameError("");
    } catch (error: any) {
      showError(error.data || "Failed to update username");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWorkspaceSubmit = async () => {
    if (!personalTeam) return;

    if (!validateWorkspaceName(personalWorkspaceName)) {
      return;
    }

    if (personalWorkspaceName.trim() === personalTeam.name) {
      return;
    }

    setIsSubmittingWorkspace(true);

    try {
      await editTeamName({ id: personalTeam._id, name: personalWorkspaceName.trim() });
      showSuccess("Personal workspace name updated successfully");
      setPersonalWorkspaceError("");
    } catch (error: any) {
      showError(error.data || "Failed to update workspace name");
    } finally {
      setIsSubmittingWorkspace(false);
    }
  };

  if (!currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader title="Account Settings" description="Manage your account information" />

        <VStack gap={6} alignItems="stretch">
          <HStack gap={12}>
            <VStack alignItems="flex-start" gap={1}>
              <FormLabel fontSize="xl" color="white" marginBottom={0}>
                Email
              </FormLabel>
              <Text fontSize="md" color="gray.400">
                {currentUser.email || "N/A"}
              </Text>
            </VStack>

            <VStack alignItems="flex-start" gap={1}>
              <FormLabel fontSize="xl" color="white" marginBottom={0}>
                Wallet Address
              </FormLabel>
              <Text fontSize="md" color="gray.300">
                {currentUser.wallet_address || "N/A"}
              </Text>
            </VStack>
          </HStack>

          <FormControl isInvalid={!!usernameError}>
            <FormLabel color="gray.300">Username</FormLabel>
            <Input
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError("");
              }}
              placeholder="Enter username"
              borderColor={usernameError ? "red.500" : "gray.800"}
              backgroundColor="gray.950"
              color="white"
              _focus={{
                borderColor: usernameError ? "red.500" : "blue.500",
                boxShadow: usernameError
                  ? "0 0 0 1px var(--chakra-colors-red-500)"
                  : "0 0 0 1px var(--chakra-colors-blue-500)",
              }}
              maxW="500px"
            />
            {usernameError && <FormErrorMessage>{usernameError}</FormErrorMessage>}
          </FormControl>

          <HStack justifyContent="flex-start" gap={3} marginTop={4}>
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              Save Changes
            </Button>
          </HStack>

          <Divider borderColor="gray.700" marginY={6} />

          {/* Personal Workspace Section */}
          {personalTeam && (
            <VStack alignItems="flex-start" gap={4}>
              <VStack alignItems="flex-start" gap={1}>
                <Text fontSize="lg" color="white" fontWeight="semibold">
                  Personal Workspace
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Customize the name of your personal workspace
                </Text>
              </VStack>
              <FormControl isInvalid={!!personalWorkspaceError}>
                <FormLabel color="gray.300">Workspace Name</FormLabel>
                <Input
                  value={personalWorkspaceName}
                  onChange={(e) => {
                    setPersonalWorkspaceName(e.target.value);
                    setPersonalWorkspaceError("");
                  }}
                  placeholder="Enter workspace name"
                  borderColor={personalWorkspaceError ? "red.500" : "gray.800"}
                  backgroundColor="gray.950"
                  color="white"
                  _focus={{
                    borderColor: personalWorkspaceError ? "red.500" : "blue.500",
                    boxShadow: personalWorkspaceError
                      ? "0 0 0 1px var(--chakra-colors-red-500)"
                      : "0 0 0 1px var(--chakra-colors-blue-500)",
                  }}
                  maxW="500px"
                />
                {personalWorkspaceError && <FormErrorMessage>{personalWorkspaceError}</FormErrorMessage>}
              </FormControl>
              <HStack justifyContent="flex-start" gap={3}>
                <Button variant="primary" size="sm" onClick={handleWorkspaceSubmit} disabled={isSubmittingWorkspace}>
                  Save Workspace Name
                </Button>
              </HStack>
            </VStack>
          )}

          <Divider borderColor="gray.700" marginY={6} />

          <VStack alignItems="flex-start" gap={4}>
            <VStack alignItems="flex-start" gap={1}>
              <Text fontSize="lg" color="white" fontWeight="semibold">
                Danger Zone
              </Text>
              <Text fontSize="sm" color="gray.400">
                Once you delete your account, there is no going back. Please be certain.
              </Text>
            </VStack>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
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
          </VStack>
        </VStack>
      </Container>
      <DeleteAccountDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} />
    </Box>
  );
}
