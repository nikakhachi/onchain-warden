"use client";

import { useState } from "react";
import { Menu, MenuButton, MenuList, MenuItem, Box, HStack, Text } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { useToast } from "../../providers/ToastContext";
import { Id } from "../../../../convex/_generated/dataModel";

interface TeamMemberMenuProps {
  teamId: Id<"teams">;
  member: {
    _id: Id<"team_members">;
    user_id: Id<"users">;
    role: "member" | "admin";
    user: {
      _id: Id<"users">;
      username: string;
      wallet_address: string;
    } | null;
  };
  currentUserId: Id<"users">;
}

export function TeamMemberMenu({ teamId, member, currentUserId }: TeamMemberMenuProps) {
  const { removeTeamMember, changeTeamMemberRole } = useUser();
  const { error: showError, success: showSuccess } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePromote = async () => {
    if (member.role === "admin") return;

    setIsProcessing(true);
    try {
      await changeTeamMemberRole({
        team_id: teamId,
        user_id: member.user_id,
        role: "admin",
      });
      showSuccess("Member promoted to admin");
    } catch (error: any) {
      showError(error.data || "Failed to promote member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDemote = async () => {
    if (member.role === "member") return;

    setIsProcessing(true);
    try {
      await changeTeamMemberRole({
        team_id: teamId,
        user_id: member.user_id,
        role: "member",
      });
      showSuccess("Admin demoted to member");
    } catch (error: any) {
      showError(error.data || "Failed to demote member");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove this member from the team?")) return;

    setIsProcessing(true);
    try {
      await removeTeamMember({
        team_id: teamId,
        user_id: member.user_id,
      });
      showSuccess("Member removed from team");
    } catch (error: any) {
      showError(error.data || "Failed to remove member");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
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
        {member.role === "member" ? (
          <MenuItem
            onClick={handlePromote}
            _hover={{ backgroundColor: "gray.800" }}
            paddingX={3}
            paddingY={2}
            disabled={isProcessing}
          >
            <HStack gap={3}>
              <Text fontSize="sm">🛡️</Text>
              <Text fontSize="sm" color="white">
                Promote to Admin
              </Text>
            </HStack>
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handleDemote}
            _hover={{ backgroundColor: "gray.800" }}
            paddingX={3}
            paddingY={2}
            disabled={isProcessing}
          >
            <HStack gap={3}>
              <Text fontSize="sm">🛡️</Text>
              <Text fontSize="sm" color="white">
                Demote to Member
              </Text>
            </HStack>
          </MenuItem>
        )}
        <MenuItem
          onClick={handleRemove}
          _hover={{ backgroundColor: "gray.800" }}
          paddingX={3}
          paddingY={2}
          disabled={isProcessing}
        >
          <HStack gap={3}>
            <Text fontSize="sm">🗑️</Text>
            <Text fontSize="sm" color="red.400">
              Remove from Team
            </Text>
          </HStack>
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
