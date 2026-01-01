"use client";

import { useState, useMemo, useEffect } from "react";
import { Box, Container, VStack, HStack, Text, Badge, Spinner } from "@chakra-ui/react";
import { useUser } from "../../providers/UserContext";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Button } from "../../components/Button";
import { CreateTeamDialog } from "../../components/DashboardSidebar/CreateTeamDialog";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { TeamMemberMenu } from "./TeamMemberMenu";
import { Id } from "../../../../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatAddress } from "../../helpers";
import { AddIcon } from "@chakra-ui/icons";

export default function TeamsPage() {
  const { teams, currentTeamId, switchTeam, currentUser } = useUser();
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(currentTeamId || null);

  // Update selectedTeamId when currentTeamId changes
  useEffect(() => {
    if (currentTeamId && !selectedTeamId) {
      setSelectedTeamId(currentTeamId);
    }
  }, [currentTeamId, selectedTeamId]);

  const selectedTeam = useMemo(() => {
    if (!selectedTeamId || !teams) return null;
    return teams.find((t) => t._id === selectedTeamId);
  }, [selectedTeamId, teams]);

  const teamMembers = useQuery(
    api.teamMembers.getTeamMembersByTeamId,
    selectedTeamId ? { team_id: selectedTeamId } : "skip",
  );

  // Get member counts for all teams
  // Get member count for selected team
  const selectedTeamMemberCount = useQuery(
    api.teamMembers.getTeamMemberCount,
    selectedTeamId ? { team_id: selectedTeamId } : "skip",
  );

  // Calculate member count including owner
  const getMemberCount = (teamId: Id<"teams">) => {
    if (selectedTeamId === teamId && selectedTeamMemberCount) {
      return selectedTeamMemberCount;
    }
    // Default to 1 (just owner) if we don't have the count yet
    return 1;
  };

  const handleTeamSelect = (teamId: Id<"teams">) => {
    setSelectedTeamId(teamId);
    switchTeam(teamId);
  };

  const getTeamInitial = (name: string) => name.charAt(0).toUpperCase();

  const getTeamColor = (index: number) => {
    const colors = ["teal.500", "blue.500", "purple.500", "pink.500", "orange.500"];
    return colors[index % colors.length];
  };

  if (!teams || !currentUser) {
    return (
      <Box flex={1} display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

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
                const memberCount = getMemberCount(team._id);
                const isDefault = index === 0;

                return (
                  <Box
                    key={team._id}
                    as="button"
                    onClick={() => handleTeamSelect(team._id)}
                    padding={4}
                    borderRadius="xl"
                    backgroundColor={isSelected ? "gray.800" : "transparent"}
                    borderWidth="2px"
                    borderColor={isSelected ? "teal.500" : "gray.700"}
                    transition="all 0.2s"
                    _hover={{
                      backgroundColor: "gray.800",
                      borderColor: isSelected ? "teal.500" : "gray.600",
                    }}
                    width="100%"
                    textAlign="left"
                  >
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack gap={3} alignItems="center">
                        <Box
                          width="40px"
                          height="40px"
                          borderRadius="full"
                          backgroundColor={getTeamColor(index)}
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
                          <HStack gap={2}>
                            {isDefault && (
                              <Badge backgroundColor="teal.500" color="white" fontSize="xs" paddingX={2} paddingY={0.5}>
                                Default
                              </Badge>
                            )}
                            <Text color="gray.400" fontSize="xs">
                              {memberCount} {memberCount === 1 ? "member" : "members"}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
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
                borderColor: "teal.500",
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
                    {teams.indexOf(selectedTeam) === 0 && (
                      <Badge backgroundColor="teal.500" color="white" fontSize="xs" paddingX={2} paddingY={0.5}>
                        Default
                      </Badge>
                    )}
                  </HStack>
                  <Text color="gray.400" fontSize="sm">
                    Manage team members and their roles
                  </Text>
                </VStack>
                <Text color="gray.400" fontSize="lg" cursor="pointer">
                  ⋯
                </Text>
              </HStack>

              <HStack justifyContent="space-between" alignItems="center" marginBottom={4}>
                <Text color="white" fontWeight="500" fontSize="md">
                  Members ({teamMembers ? teamMembers.length + 1 : 1})
                </Text>
                <Button variant="primary" size="sm" onClick={() => setIsAddMemberOpen(true)}>
                  + Add Member
                </Button>
              </HStack>

              <VStack gap={2} alignItems="stretch">
                {/* Owner */}
                <Box padding={4} borderRadius="xl" backgroundColor="gray.800" borderWidth="1px" borderColor="gray.700">
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
                        {getTeamInitial(currentUser.username)}
                      </Box>
                      <VStack alignItems="flex-start" gap={0}>
                        <Text color="white" fontWeight="500" fontSize="sm">
                          {currentUser.username}
                        </Text>
                        <Text color="gray.400" fontSize="xs" fontFamily="mono">
                          {formatAddress(currentUser.wallet_address)}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge backgroundColor="teal.500" color="white" fontSize="xs" paddingX={3} paddingY={1}>
                      👑 Owner
                    </Badge>
                  </HStack>
                </Box>

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
                              backgroundColor={member.role === "admin" ? "purple.500" : "gray.600"}
                              color="white"
                              fontSize="xs"
                              paddingX={3}
                              paddingY={1}
                            >
                              {member.role === "admin" ? "Admin" : "Member"}
                            </Badge>
                            <TeamMemberMenu teamId={selectedTeam._id} member={member} currentUserId={currentUser._id} />
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
      {selectedTeamId && (
        <AddTeamMemberDialog
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          teamId={selectedTeamId}
        />
      )}
    </Box>
  );
}
