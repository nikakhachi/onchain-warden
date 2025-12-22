"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { UpdateIntegrationDialog } from "./UpdateDialog";
import { generateSignatureData } from "@/app/helpers";

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
  const { address: walletAddress, signMessage } = useWallet();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteOwnerIntegration = useAction(
    api.ownerIntegrations.deleteOwnerIntegrationAction
  );

  const handleEdit = () => {
    setIsUpdateOpen(true);
  };

  const handleDelete = async () => {
    if (!walletAddress) {
      alert("Error: Wallet not connected.");
      return;
    }

    if (!confirm("Are you sure you want to delete this integration?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const { message, expiresAt, nonce } = generateSignatureData();
      const signature = await signMessage(message);
      await deleteOwnerIntegration({
        id: integrationId,
        owner: walletAddress,
        signature,
        expiresAt,
        nonce,
      });
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error
            ? error.message
            : "Failed to delete integration"
        }`
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
