"use client";

import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
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
  const { error: showError, success: showSuccess } = useToast();
  const { deleteOwnerIntegration } = useUser();
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    setIsUpdateOpen(true);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this integration?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteOwnerIntegration({
        id: integrationId,
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
