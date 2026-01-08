"use client";

import { useState, useMemo, useEffect } from "react";
import { Box, Container, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Button } from "../../components/Button";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { EditTeamNameDialog } from "./EditTeamNameDialog";
import { TeamMemberMenu } from "./TeamMemberMenu";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatAddress } from "@/app/shared/helpers";
import { GRADIENTS, GRADIENT_COLORS } from "../../theme";
import { useToast } from "../../providers/ToastContext";
import { LoadingScreen } from "../components/LoadingScreen";
// import { CreateTeamDialog } from "../components/DashboardSidebar/CreateTeamDialog";
import { useAuth } from "@/app/providers/AuthContext";
import { ComingSoon } from "./ComingSoon";
import { ModalComingSoon } from "./ComingSoon";

export default function TeamsPage() {
  const { teams, currentTeamId, selectedTeam, teamMembers, switchTeam, deleteTeam, leaveTeam } = useUser();
  const { currentUser, accessToken } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  // const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditTeamNameOpen, setIsEditTeamNameOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const regularTeams = useMemo(() => teams?.filter((t) => !t.is_personal) || [], [teams]);

  // Only auto-select a team if no team is selected at all (initial load)
  useEffect(() => {
    if (!currentTeamId && teams) {
      // If no team selected, prefer first regular team, otherwise personal
      if (regularTeams.length > 0) {
        switchTeam(regularTeams[0]._id);
      } else {
        const personalTeam = teams.find((t) => t.is_personal);
        if (personalTeam) {
          switchTeam(personalTeam._id);
        }
      }
    }
  }, [teams, currentTeamId, regularTeams, switchTeam]);

  const sortedTeamMembers = useMemo(() => {
    if (!teamMembers || !currentUser) return teamMembers;

    const rolePriority: Record<string, number> = {
      owner: 2,
      admin: 3,
      member: 4,
    };

    return [...teamMembers].sort((a, b) => {
      // Current user always comes first
      const aIsCurrentUser = a.user_id === currentUser._id;
      const bIsCurrentUser = b.user_id === currentUser._id;

      if (aIsCurrentUser && !bIsCurrentUser) return -1;
      if (!aIsCurrentUser && bIsCurrentUser) return 1;

      // If both or neither are current user, sort by role priority
      const aPriority = rolePriority[a.role] || 999;
      const bPriority = rolePriority[b.role] || 999;

      return aPriority - bPriority;
    });
  }, [teamMembers, currentUser]);

  // Get user role in selected team
  const selectedTeamUserRole = useQuery(
    api.teamMembers.getUserRoleInTeam,
    currentTeamId && accessToken ? { team_id: currentTeamId, accessToken } : "skip",
  );

  const handleTeamSelect = (teamId: Id<"teams">) => {
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

  const handleLeaveTeam = async () => {
    if (!currentTeamId) return;
    if (!confirm("Are you sure you want to leave this team?")) return;

    try {
      await leaveTeam({ team_id: currentTeamId });
      showSuccess("You have left the team");
      // Switch to the first available regular team or personal team
      if (regularTeams.length > 0) {
        const remainingTeams = regularTeams.filter((t) => t._id !== currentTeamId);
        if (remainingTeams.length > 0) {
          switchTeam(remainingTeams[0]._id);
        } else {
          // If no regular teams left, switch to personal
          const personalTeam = teams?.find((t) => t.is_personal);
          if (personalTeam) {
            switchTeam(personalTeam._id);
          }
        }
      } else {
        // If no regular teams, switch to personal
        const personalTeam = teams?.find((t) => t.is_personal);
        if (personalTeam) {
          switchTeam(personalTeam._id);
        }
      }
    } catch (error: any) {
      showError(error.data || "Failed to leave team");
    }
  };

  if (!teams || !currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} paddingY={8}>
      {!regularTeams.length ? (
        <ComingSoon />
      ) : (
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
                {regularTeams.map((team, index) => {
                  const isSelected = currentTeamId === team._id;

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
                onClick={() => setIsComingSoonOpen(true)}
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
                {selectedTeam.is_personal ? (
                  <VStack alignItems="center" justifyContent="center" paddingY={12} gap={4}>
                    <Text color="white" fontWeight="600" fontSize="xl">
                      Select a Team
                    </Text>
                    <Text color="gray.400" fontSize="sm" textAlign="center" maxW="400px">
                      Select a team from the list to view and manage its members, roles, and settings.
                    </Text>
                  </VStack>
                ) : (
                  <>
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
                          <Button
                            variant="secondary"
                            size="sm"
                            _hover={{ color: "white", backgroundColor: "gray.700" }}
                            onClick={() => setIsEditTeamNameOpen(true)}
                          >
                            Edit Team Name
                          </Button>

                          <Button
                            variant="secondary"
                            size="sm"
                            color="red.400"
                            _hover={{ backgroundColor: "gray.700" }}
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Deleting team will delete all integrations, alerts, and everything related to the team. Proceed?",
                                )
                              ) {
                                try {
                                  if (currentTeamId) {
                                    await deleteTeam({ id: currentTeamId });
                                    showSuccess("Team deleted successfully");
                                  }
                                } catch (error: any) {
                                  showError(error.data || "Failed to delete team");
                                }
                              }
                            }}
                          >
                            Delete Team
                          </Button>
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
                      {sortedTeamMembers?.map((member, index) => {
                        if (!member.user) return null;
                        return (
                          <Box
                            key={member._id}
                            padding={4}
                            borderRadius={index === 0 ? "none" : "xl"}
                            backgroundColor={index === 0 ? "transparent" : "gray.800"}
                            borderWidth={index === 0 ? "0" : "1px"}
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
                                    {member.user.email
                                      ? member.user.email
                                      : member.user.wallet_address
                                        ? formatAddress(member.user.wallet_address)
                                        : null}
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
                                {member.user_id !== currentUser._id && (
                                  <TeamMemberMenu
                                    teamId={selectedTeam._id}
                                    member={member}
                                    currentUserRole={selectedTeamUserRole}
                                    currentUserId={currentUser?._id}
                                  />
                                )}
                              </HStack>
                            </HStack>
                          </Box>
                        );
                      })}
                    </VStack>
                  </>
                )}
              </Box>
            )}
          </HStack>
          {/* <CreateTeamDialog isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} /> */}
          <ModalComingSoon isOpen={isComingSoonOpen} onClose={() => setIsComingSoonOpen(false)} />
          {currentTeamId && selectedTeam && (
            <>
              <AddTeamMemberDialog
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                teamId={currentTeamId}
              />
              <EditTeamNameDialog
                isOpen={isEditTeamNameOpen}
                onClose={() => setIsEditTeamNameOpen(false)}
                teamId={currentTeamId}
                currentName={selectedTeam.name}
              />
            </>
          )}
        </Container>
      )}
    </Box>
  );
}
