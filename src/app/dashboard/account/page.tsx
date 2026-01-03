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
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Button } from "../../components/Button";
import { useWallet } from "@/app/providers/WalletContext";
import { LoadingScreen } from "../components/LoadingScreen";

export default function AccountSettingsPage() {
  const router = useRouter();
  const { error: showError, success: showSuccess } = useToast();
  const { updateUsername } = useUser();
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hasValidToken, currentUser } = useWallet();

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

  if (!currentUser || !hasValidToken) return <LoadingScreen />;

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader title="Account Settings" description="Manage your account information" />

        <VStack gap={6} alignItems="stretch">
          <VStack alignItems="flex-start" gap={1}>
            <FormLabel color="gray.300" marginBottom={0}>
              Wallet Address
            </FormLabel>
            <Text fontFamily="mono" fontSize="sm" color="gray.300">
              {currentUser.wallet_address}
            </Text>
          </VStack>

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
            />
            {usernameError && <FormErrorMessage>{usernameError}</FormErrorMessage>}
          </FormControl>

          <HStack justifyContent="flex-end" gap={3} marginTop={4}>
            <Button variant="secondary" size="sm" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              Save Changes
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
