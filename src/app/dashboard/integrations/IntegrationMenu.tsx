"use client";

import { useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { UpdateIntegrationDialog } from "./UpdateDialog";
import { ICON_COLORS } from "@/app/theme";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";

interface IntegrationMenuProps {
  integrationId: Id<"team_integrations">;
  label: string;
  integrationTypeId: string;
  data: Record<string, string>;
}

export function IntegrationMenu({ integrationId, label, integrationTypeId, data }: IntegrationMenuProps) {
  const { error: showError, success: showSuccess } = useToast();
  const { deleteTeamIntegration } = useUser();
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
      await deleteTeamIntegration({
        id: integrationId,
      });
      showSuccess("Integration deleted successfully");
    } catch (error: any) {
      showError(error.data || "Failed to delete integration");
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
          <RiEdit2Fill color={ICON_COLORS.indigo} />
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
          <MdDelete color={ICON_COLORS.rose} />
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
