"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Box, HStack } from "@chakra-ui/react";
import { useWallet } from "../../providers/WalletContext";
import { CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE } from "../../constants";
import { EditWatcherModal } from "./EditWatcherModal";

interface WatcherMenuProps {
  watcherId: Id<"event_watchers">;
  watcher: {
    eventWatcher: {
      _id: Id<"event_watchers">;
      label: string;
      event_abi: string;
      condition: any[];
      display: any;
      owner_integration_ids: Id<"owner_integrations">[];
    };
    chain: { name: string } | null;
  };
}

export function WatcherMenu({ watcherId, watcher }: WatcherMenuProps) {
  const { address: walletAddress, signMessage } = useWallet();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteEventWatcher = useAction(
    api.eventWatchers.deleteEventWatcherAction
  );

  const handleDelete = async () => {
    if (!walletAddress) {
      alert("Error: Wallet not connected.");
      return;
    }

    if (!confirm("Are you sure you want to delete this watcher?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const signature = await signMessage(
        CREATE_EVENT_SUBSCRIPTION_SIGN_MESSAGE
      );
      await deleteEventWatcher({
        id: watcherId,
        owner: walletAddress,
        signature,
      });
    } catch (error) {
      alert(
        `Error: ${
          error instanceof Error ? error.message : "Failed to delete watcher"
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
          onClick={(e) => {
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
          onClick={(e) => {
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
