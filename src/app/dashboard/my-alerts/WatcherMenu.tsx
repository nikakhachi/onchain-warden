"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { useToast } from "../../providers/ToastContext";
import { EditWatcherModal } from "./EditWatcherModal";
import { generateSignatureData } from "@/app/helpers";

interface WatcherMenuProps {
  watcherId: Id<"event_watchers">;
  watcher: {
    eventWatcher: {
      _id: Id<"event_watchers">;
      label: string;
      event_abi: string;
      contract_address: string;
      condition: any[];
      display: any;
      owner_integration_ids: Id<"owner_integrations">[];
    };
    chain: { name: string } | null;
  };
}

export function WatcherMenu({ watcherId, watcher }: WatcherMenuProps) {
  const { address: walletAddress, signMessage } = useWallet();
  const { error: showError, success: showSuccess } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteEventWatcher = useAction(
    api.eventWatchers.deleteEventWatcherAction
  );

  const handleDelete = async () => {
    if (!walletAddress) {
      showError("Wallet not connected");
      return;
    }

    if (!confirm("Are you sure you want to delete this watcher?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const { message, expiresAt, nonce } = generateSignatureData();
      const signature = await signMessage(message);
      await deleteEventWatcher({
        id: watcherId,
        owner: walletAddress,
        signature,
        expiresAt,
        nonce,
      });
      showSuccess("Alert deleted successfully");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to delete alert"
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
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="16px"
          _hover={{ backgroundColor: "gray.700" }}
        >
          ✏️
        </Box>
        <Box
          as="button"
          cursor={isDeleting ? "not-allowed" : "pointer"}
          padding={1.5}
          borderRadius="md"
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
          _hover={{ backgroundColor: "gray.700" }}
        >
          ❌
        </Box>
      </HStack>
      <EditWatcherModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        watcher={watcher}
      />
    </>
  );
}
