"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { useToast } from "../../providers/ToastContext";
import { UpdateIntegrationDialog } from "./UpdateDialog";

interface IntegrationMenuProps {
  integrationId: Id<"owner_integrations">;
  label: string;
  integrationTypeId: Id<"integrations">;
  data: Record<string, string>;
}

export function IntegrationMenu({
  integrationId,
  label,
  integrationTypeId,
  data,
}: IntegrationMenuProps) {
  const { currentAccount, getAccessTokenOrAuthenticate } = useWallet();
  const { error: showError, success: showSuccess } = useToast();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOwnerIntegration = useMutation(
    api.ownerIntegrations.deleteOwnerIntegration
  );

  const handleEdit = () => {
    setIsUpdateOpen(true);
  };

  const handleDelete = async () => {
    if (!currentAccount) {
      showError("Wallet not connected");
      return;
    }

    if (!confirm("Are you sure you want to delete this integration?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const accessToken = await getAccessTokenOrAuthenticate();
      if (!accessToken) {
        showError("Failed to authenticate. Please try again.");
        setIsDeleting(false);
        return;
      }

      await deleteOwnerIntegration({
        id: integrationId,
        accessToken,
      });
      showSuccess("Integration deleted successfully");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to delete integration"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <HStack gap={2}>
        <Box
          as="button"
          cursor="pointer"
          padding={1.5}
          borderRadius="md"
          _hover={{ backgroundColor: "gray.800" }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleEdit();
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
        >
          ✏️
        </Box>

        <Box
          as="button"
          cursor={isDeleting ? "not-allowed" : "pointer"}
          padding={1.5}
          borderRadius="md"
          _hover={isDeleting ? {} : { backgroundColor: "gray.800" }}
          opacity={isDeleting ? 0.5 : 1}
          onClick={(e: React.MouseEvent) => {
            if (isDeleting) {
              e.preventDefault();
              e.stopPropagation();
              return;
            }
            e.stopPropagation();
            handleDelete();
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
        >
          ❌
        </Box>
      </HStack>

      <UpdateIntegrationDialog
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
        }}
        integrationId={integrationId}
        initialLabel={label}
        initialIntegrationId={integrationTypeId}
        initialData={data}
      />
    </>
  );
}
