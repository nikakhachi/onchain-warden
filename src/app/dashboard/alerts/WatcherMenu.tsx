"use client";

import { useState } from "react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";
import { Menu, MenuButton, MenuList, MenuItem, Box, HStack, Text } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { EditWatcherModal } from "./EditWatcherModal";
import { MdDelete } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { HiDuplicate } from "react-icons/hi";
import { FaPause, FaPlay } from "react-icons/fa6";
import { useRouter } from "next/navigation";

interface WatcherMenuProps {
  watcherId: Id<"event_watchers">;
  watcher: {
    eventWatcher: Doc<"event_watchers">;
    chain: { name: string } | null;
  };
}

export function WatcherMenu({ watcherId, watcher }: WatcherMenuProps) {
  const { error: showError, success: showSuccess } = useToast();
  const { deleteEventWatcher, activateEventWatcher, deactivateEventWatcher, duplicateEventWatcher, isLimitReached } =
    useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isActive = watcher.eventWatcher.is_active;

  const handlePause = async () => {
    if (!confirm("Are you sure you want to pause this alert?")) return;

    setIsProcessing(true);
    try {
      await deactivateEventWatcher({ id: watcherId });
      showSuccess("Alert paused successfully");
    } catch (error: any) {
      showError(error.data || "Failed to pause alert");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnpause = async () => {
    if (!confirm("Are you sure you want to unpause this alert?")) return;

    setIsProcessing(true);
    try {
      await activateEventWatcher({ id: watcherId });
      showSuccess("Alert activated successfully");
    } catch (error: any) {
      showError(error.data || "Failed to activate alert");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDuplicate = async () => {
    if (isLimitReached) {
      router.push("/dashboard/pricing?highlight=solo");
      return;
    }

    if (!confirm("Are you sure you want to duplicate this alert?")) return;

    setIsProcessing(true);
    try {
      await duplicateEventWatcher({ id: watcherId });
      showSuccess("Alert duplicated successfully");
    } catch (error: any) {
      showError(error.data || "Failed to duplicate alert");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this alert?")) return;

    setIsProcessing(true);
    try {
      await deleteEventWatcher({ id: watcherId });
      showSuccess("Alert deleted successfully");
    } catch (error: any) {
      showError(error.data || "Failed to delete alert");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Menu>
        <MenuButton
          as={Box}
          padding={2}
          borderRadius="md"
          _hover={{ backgroundColor: "gray.700" }}
          cursor="pointer"
          disabled={isProcessing}
        >
          <Text color="gray.400" fontSize="lg">
            ⋯
          </Text>
        </MenuButton>
        <MenuList backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" minWidth="200px">
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            _hover={{ backgroundColor: "gray.800" }}
            paddingX={3}
            paddingY={2}
            disabled={isProcessing}
            backgroundColor="gray.900"
            color="white"
          >
            <HStack gap={3}>
              <RiEdit2Fill />
              <Text fontSize="sm">Edit</Text>
            </HStack>
          </MenuItem>

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate();
            }}
            _hover={{ backgroundColor: "gray.800" }}
            paddingX={3}
            paddingY={2}
            disabled={isProcessing}
            backgroundColor="gray.900"
            color="white"
          >
            <HStack gap={3}>
              <HiDuplicate />
              <Text fontSize="sm">Duplicate</Text>
            </HStack>
          </MenuItem>

          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (isActive) {
                handlePause();
              } else {
                handleUnpause();
              }
            }}
            _hover={{ backgroundColor: "gray.800" }}
            paddingX={3}
            paddingY={2}
            disabled={isProcessing}
            backgroundColor="gray.900"
            color="white"
          >
            <HStack gap={3}>
              {isActive ? <FaPause /> : <FaPlay />}
              <Text fontSize="sm">{isActive ? "Pause" : "Unpause"}</Text>
            </HStack>
          </MenuItem>
          <MenuItem
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            _hover={{ backgroundColor: "gray.800" }}
            backgroundColor="gray.900"
            paddingX={3}
            paddingY={2}
            disabled={isProcessing}
            color="red.400"
          >
            <HStack gap={3}>
              <MdDelete />
              <Text fontSize="sm">Delete</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>
      <EditWatcherModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} watcher={watcher} />
    </>
  );
}
