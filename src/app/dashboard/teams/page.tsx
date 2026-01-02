"use client";

import { useState, useMemo, useEffect } from "react";
import { Box, Container, VStack, HStack, Text, Badge, IconButton } from "@chakra-ui/react";
import { EditIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { useUser } from "../../providers/UserContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Button } from "../../components/Button";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { EditTeamNameDialog } from "./EditTeamNameDialog";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatAddress } from "../../helpers";
import { GRADIENTS, GRADIENT_COLORS, ICON_COLORS } from "../../theme";
import { useToast } from "../../providers/ToastContext";
import { LoadingScreen } from "../components/LoadingScreen";
import { CreateTeamDialog } from "../components/DashboardSidebar/CreateTeamDialog";

export default function TeamsPage() {
  const {
    teams,
    currentTeamId,
    switchTeam,
    currentUser,
    accessToken,
    deleteTeam,
    removeTeamMember,
    changeTeamMemberRole,
    leaveTeam,
  } = useUser();
  const { success: showSuccess, error: showError } = useToast();
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditTeamNameOpen, setIsEditTeamNameOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(currentTeamId || null);
  const [processingMemberId, setProcessingMemberId] = useState<Id<"team_members"> | null>(null);

  // Update selectedTeamId when currentTeamId changes
  useEffect(() => {
    if (currentTeamId) {
      setSelectedTeamId(currentTeamId);
    }
  }, [currentTeamId]);

  // Clear selectedTeamId if the selected team no longer exists
  useEffect(() => {
    if (selectedTeamId && teams) {
      const teamExists = teams.some((t) => t._id === selectedTeamId);
      if (!teamExists) {
        // If the selected team was deleted, select the first available team or null
        if (teams.length > 0) {
          setSelectedTeamId(teams[0]._id);
        } else {
          setSelectedTeamId(null);
        }
      }
    }
  }, [teams, selectedTeamId]);

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId || !teams) return null;
    return teams.find((t) => t._id === selectedTeamId);
  }, [selectedTeamId, teams]);

  const teamMembers = useQuery(
    api.teamMembers.getTeamMembersByTeamId,
    selectedTeamId && accessToken ? { team_id: selectedTeamId, accessToken } : "skip",
  );

  // Get user role in selected team
  const selectedTeamUserRole = useQuery(
    api.teamMembers.getUserRoleInTeam,
    selectedTeamId && accessToken ? { team_id: selectedTeamId, accessToken } : "skip",
  );

  const handleTeamSelect = (teamId: Id<"teams">) => {
    setSelectedTeamId(teamId);
    switchTeam(teamId);
  };

  const getTeamInitial = (name: string) => name.charAt(0).toUpperCase();

  const getTeamColor = (index: number) => {
    // Use gradients that alternate between blue and purple variations
    const gradients = [
      GRADIENTS.primaryDiagonal,
      GRADIENTS.primaryDiagonalReverse,
      GRADIENTS.primary,
      GRADIENTS.primaryReverse,
    ];
    return gradients[index % gradients.length];
  };

  const handlePromote = async (memberId: Id<"team_members">, userId: Id<"users">) => {
    if (!selectedTeamId) return;
    setProcessingMemberId(memberId);
    try {
      await changeTeamMemberRole({
        team_id: selectedTeamId,
        user_id: userId,
        role: "admin",
      });
      showSuccess("Member promoted to admin");
    } catch (error: any) {
      showError(error.data || "Failed to promote member");
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleDemote = async (memberId: Id<"team_members">, userId: Id<"users">) => {
    if (!selectedTeamId) return;
    setProcessingMemberId(memberId);
    try {
      await changeTeamMemberRole({
        team_id: selectedTeamId,
        user_id: userId,
        role: "member",
      });
      showSuccess("Admin demoted to member");
    } catch (error: any) {
      showError(error.data || "Failed to demote member");
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleRemove = async (memberId: Id<"team_members">, userId: Id<"users">) => {
    if (!selectedTeamId) return;
    if (!confirm("Are you sure you want to remove this member from the team?")) return;

    setProcessingMemberId(memberId);
    try {
      await removeTeamMember({
        team_id: selectedTeamId,
        user_id: userId,
      });
      showSuccess("Member removed from team");
    } catch (error: any) {
      showError(error.data || "Failed to remove member");
    } finally {
      setProcessingMemberId(null);
    }
  };

  const handleLeaveTeam = async () => {
    if (!selectedTeamId) return;
    if (!confirm("Are you sure you want to leave this team?")) return;

    try {
      await leaveTeam({ team_id: selectedTeamId });
      showSuccess("You have left the team");
      // Switch to the first available team or clear selection
      if (teams && teams.length > 1) {
        const remainingTeams = teams.filter((t) => t._id !== selectedTeamId);
        if (remainingTeams.length > 0) {
          switchTeam(remainingTeams[0]._id);
          setSelectedTeamId(remainingTeams[0]._id);
        }
      } else {
        setSelectedTeamId(null);
      }
    } catch (error: any) {
      showError(error.data || "Failed to leave team");
    }
  };

  if (!teams || !currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader title="Teams" description="Manage your teams and their members" marginBottom={6} />

        <HStack alignItems="flex-start" gap={6}>
          {/* Left: Your Teams List */}
          <Box
            flex={1}
            maxW="400px"
            padding={6}
            borderRadius="2xl"
            backgroundColor="gray.900"
            borderWidth="1px"
            borderColor="gray.800"
          >
            <HStack justifyContent="space-between" alignItems="center" marginBottom={4}>
              <Text color="white" fontWeight="600" fontSize="md">
                Your Teams
              </Text>
            </HStack>

            <VStack gap={2} alignItems="stretch">
              {teams.map((team, index) => {
                const isSelected = selectedTeamId === team._id;

                return (
                  <Box
                    key={team._id}
                    padding={4}
                    borderRadius="xl"
                    backgroundColor={isSelected ? "gray.800" : "transparent"}
                    borderWidth="2px"
                    borderColor={isSelected ? GRADIENT_COLORS.purple : "gray.700"}
                    transition="all 0.2s"
                    _hover={{
                      backgroundColor: "gray.800",
                      borderColor: isSelected ? GRADIENT_COLORS.purple : GRADIENT_COLORS.blue,
                    }}
                    width="100%"
                    as="button"
                    onClick={() => handleTeamSelect(team._id)}
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <Box flex={1} textAlign="left">
                        <HStack gap={3} alignItems="center">
                          <Box
                            width="40px"
                            height="40px"
                            borderRadius="full"
                            background={getTeamColor(index)}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="600"
                            fontSize="lg"
                          >
                            {getTeamInitial(team.name)}
                          </Box>
                          <VStack alignItems="flex-start" gap={0}>
                            <Text color="white" fontWeight="500" fontSize="sm">
                              {team.name}
                            </Text>
                          </VStack>
                        </HStack>
                      </Box>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
            <Box
              mt={2}
              as="button"
              onClick={() => setIsCreateTeamOpen(true)}
              padding={4}
              borderRadius="xl"
              borderWidth="2px"
              borderStyle="dashed"
              borderColor="gray.700"
              backgroundColor="transparent"
              transition="all 0.2s"
              _hover={{
                borderColor: GRADIENT_COLORS.purple,
                backgroundColor: "gray.800",
              }}
              width="100%"
            >
              <HStack justifyContent="center" alignItems="center" gap={2}>
                <Text fontSize="lg">+</Text>
                <Text color="gray.400" fontSize="sm">
                  New Team
                </Text>
              </HStack>
            </Box>
          </Box>

          {/* Right: Team Details */}
          {selectedTeam && (
            <Box
              flex={1}
              padding={6}
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
            >
              <HStack justifyContent="space-between" alignItems="flex-start" marginBottom={4}>
                <VStack alignItems="flex-start" gap={1}>
                  <HStack gap={2} alignItems="center">
                    <Text color="white" fontWeight="600" fontSize="lg">
                      {selectedTeam.name}
                    </Text>
                  </HStack>
                  <Text color="gray.400" fontSize="sm">
                    Manage team members and their roles
                  </Text>
                </VStack>
                {selectedTeamUserRole === "owner" ? (
                  <HStack gap={2}>
                    <IconButton
                      aria-label="Edit team name"
                      icon={<EditIcon />}
                      size="sm"
                      variant="ghost"
                      color={ICON_COLORS.indigo}
                      _hover={{ color: "white", backgroundColor: "gray.700" }}
                      onClick={() => setIsEditTeamNameOpen(true)}
                    />
                    {teams && teams.length > 1 && (
                      <IconButton
                        aria-label="Delete team"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        color={ICON_COLORS.rose}
                        _hover={{ color: "red.400", backgroundColor: "gray.700" }}
                        onClick={async () => {
                          if (
                            window.confirm(
                              "Deleting team will delete all integrations, alerts, and everything related to the team. Proceed?",
                            )
                          ) {
                            try {
                              if (selectedTeamId) {
                                await deleteTeam({ id: selectedTeamId });
                                showSuccess("Team deleted successfully");
                                // Clear selectedTeamId - it will be updated by the useEffect when teams refresh
                                setSelectedTeamId(null);
                              }
                            } catch (error: any) {
                              showError(error.data || "Failed to delete team");
                            }
                          }
                        }}
                      />
                    )}
                  </HStack>
                ) : (
                  <Button variant="secondary" size="sm" onClick={handleLeaveTeam}>
                    Leave Team
                  </Button>
                )}
              </HStack>

              <HStack justifyContent="space-between" alignItems="center" marginBottom={4}>
                <Text color="white" fontWeight="500" fontSize="md">
                  Members ({teamMembers?.length})
                </Text>
                {(selectedTeamUserRole === "owner" || selectedTeamUserRole === "admin") && (
                  <Button variant="primary" size="sm" onClick={() => setIsAddMemberOpen(true)}>
                    + Add Member
                  </Button>
                )}
              </HStack>

              <VStack gap={2} alignItems="stretch">
                {/* Members */}
                {teamMembers &&
                  teamMembers.map((member) => {
                    if (!member.user) return null;
                    return (
                      <Box
                        key={member._id}
                        padding={4}
                        borderRadius="xl"
                        backgroundColor="gray.800"
                        borderWidth="1px"
                        borderColor="gray.700"
                      >
                        <HStack justifyContent="space-between" alignItems="center">
                          <HStack gap={3} alignItems="center">
                            <Box
                              width="40px"
                              height="40px"
                              borderRadius="full"
                              backgroundColor="gray.600"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontWeight="600"
                              fontSize="sm"
                            >
                              {getTeamInitial(member.user.username)}
                            </Box>
                            <VStack alignItems="flex-start" gap={0}>
                              <Text color="white" fontWeight="500" fontSize="sm">
                                {member.user.username}
                              </Text>
                              <Text color="gray.400" fontSize="xs" fontFamily="mono">
                                {formatAddress(member.user.wallet_address)}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack gap={2} alignItems="center">
                            <Badge
                              backgroundColor="transparent"
                              borderWidth="1px"
                              borderColor="gray.700"
                              borderRadius="md"
                              color="white"
                              fontSize="xs"
                              paddingX={3}
                              paddingY={1}
                            >
                              {member.role}
                            </Badge>
                            {member.role !== "owner" && (
                              <>
                                {selectedTeamUserRole === "owner" && (
                                  <HStack gap={1}>
                                    {member.role === "member" && (
                                      <IconButton
                                        aria-label="Promote to admin"
                                        icon={<ChevronUpIcon />}
                                        size="sm"
                                        variant="ghost"
                                        color={ICON_COLORS.blue}
                                        _hover={{ color: "white", backgroundColor: "gray.700" }}
                                        onClick={() => handlePromote(member._id, member.user_id)}
                                        disabled={processingMemberId === member._id}
                                      />
                                    )}
                                    {member.role === "admin" && (
                                      <IconButton
                                        aria-label="Demote to member"
                                        icon={<ChevronDownIcon />}
                                        size="sm"
                                        variant="ghost"
                                        color={ICON_COLORS.blue}
                                        _hover={{ color: "white", backgroundColor: "gray.700" }}
                                        onClick={() => handleDemote(member._id, member.user_id)}
                                        disabled={processingMemberId === member._id}
                                      />
                                    )}
                                  </HStack>
                                )}
                                {(selectedTeamUserRole === "owner" || selectedTeamUserRole === "admin") &&
                                  member.user._id !== currentUser._id && (
                                    <IconButton
                                      aria-label="Remove member"
                                      icon={<DeleteIcon />}
                                      size="sm"
                                      variant="ghost"
                                      color={ICON_COLORS.rose}
                                      _hover={{ color: "red.400", backgroundColor: "gray.700" }}
                                      onClick={() => handleRemove(member._id, member.user_id)}
                                      disabled={processingMemberId === member._id}
                                    />
                                  )}
                              </>
                            )}
                          </HStack>
                        </HStack>
                      </Box>
                    );
                  })}
              </VStack>
            </Box>
          )}
        </HStack>
      </Container>

      <CreateTeamDialog isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
      {selectedTeamId && selectedTeam && (
        <>
          <AddTeamMemberDialog
            isOpen={isAddMemberOpen}
            onClose={() => setIsAddMemberOpen(false)}
            teamId={selectedTeamId}
          />
          <EditTeamNameDialog
            isOpen={isEditTeamNameOpen}
            onClose={() => setIsEditTeamNameOpen(false)}
            teamId={selectedTeamId}
            currentName={selectedTeam.name}
          />
        </>
      )}
    </Box>
  );
}
