"use client";

import { useState } from "react";
import { Box, VStack, HStack, Text, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { CreateTeamDialog } from "./CreateTeamDialog";

interface Team {
  _id: Id<"teams">;
  name: string;
  owner_user_id: Id<"users">;
}

interface TeamSelectorProps {
  teams: Team[] | undefined;
  currentTeamId: Id<"teams"> | null;
  onTeamSelect: (teamId: Id<"teams">) => void;
}

function getTeamInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

export function TeamSelector({ teams, currentTeamId, onTeamSelect }: TeamSelectorProps) {
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const currentTeam = teams?.find((t) => t._id === currentTeamId);

  if (teams === undefined) {
    return (
      <Box
        paddingX={4}
        paddingY={3}
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
        width="100%"
      >
        <Text fontSize="sm" color="gray.400">
          Loading teams...
        </Text>
      </Box>
    );
  }

  if (teams.length === 0) {
    return (
      <>
        <Box
          as="button"
          onClick={() => setIsCreateTeamOpen(true)}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={4}
          paddingY={3}
          borderRadius="lg"
          backgroundColor="gray.800"
          borderWidth="1px"
          borderColor="gray.700"
          color="white"
          transition="all 0.2s"
          _hover={{
            backgroundColor: "gray.700",
            borderColor: "gray.600",
          }}
          width="100%"
        >
          <HStack gap={3}>
            <Box
              width="32px"
              height="32px"
              borderRadius="full"
              backgroundColor="teal.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="600"
              fontSize="sm"
            >
              +
            </Box>
            <Text fontSize="sm" fontWeight="500">
              Create Team
            </Text>
          </HStack>
        </Box>
        <CreateTeamDialog isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
      </>
    );
  }

  return (
    <>
      <Menu>
        <MenuButton
          as={Box}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          paddingX={4}
          paddingY={3}
          borderRadius="lg"
          backgroundColor="gray.800"
          borderWidth="1px"
          borderColor="gray.700"
          color="white"
          transition="all 0.2s"
          _hover={{
            backgroundColor: "gray.700",
            borderColor: "gray.600",
          }}
          _expanded={{
            backgroundColor: "gray.700",
            borderColor: "gray.600",
          }}
          width="100%"
        >
          <HStack gap={3} flex={1}>
            <Box
              width="32px"
              height="32px"
              borderRadius="full"
              backgroundColor="teal.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="600"
              fontSize="sm"
              flexShrink={0}
            >
              {currentTeam ? getTeamInitial(currentTeam.name) : "T"}
            </Box>
            <Text fontSize="sm" fontWeight="500" flex={1} textAlign="left" noOfLines={1}>
              {currentTeam?.name || "Select Team"}
            </Text>
            <Text fontSize="sm" flexShrink={0}>
              ⬇️
            </Text>
          </HStack>
        </MenuButton>
        <MenuList backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" minWidth="200px">
          <Box paddingX={2} paddingY={2}>
            <Text fontSize="xs" color="gray.400" fontWeight="600" paddingX={2} paddingY={1} textTransform="uppercase">
              Switch Team
            </Text>
          </Box>
          {teams.map((team) => (
            <MenuItem
              key={team._id}
              onClick={() => onTeamSelect(team._id)}
              backgroundColor={currentTeamId === team._id ? "gray.800" : "transparent"}
              _hover={{
                backgroundColor: "gray.800",
              }}
              paddingX={3}
              paddingY={2}
            >
              <HStack gap={3} width="100%">
                <Box
                  width="24px"
                  height="24px"
                  borderRadius="full"
                  backgroundColor="gray.700"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontWeight="600"
                  fontSize="xs"
                  flexShrink={0}
                >
                  {getTeamInitial(team.name)}
                </Box>
                <Text fontSize="sm" color="white" flex={1}>
                  {team.name}
                </Text>
                {currentTeamId === team._id && (
                  <Box width="16px" height="16px" flexShrink={0}>
                    <Box
                      width="100%"
                      height="100%"
                      borderRadius="full"
                      backgroundColor="teal.500"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Box width="8px" height="8px" borderRadius="full" backgroundColor="white" />
                    </Box>
                  </Box>
                )}
              </HStack>
            </MenuItem>
          ))}
          <Box borderTopWidth="1px" borderTopColor="gray.800" marginTop={1} paddingTop={1}>
            <MenuItem
              onClick={() => setIsCreateTeamOpen(true)}
              _hover={{
                backgroundColor: "gray.800",
              }}
              paddingX={3}
              paddingY={2}
            >
              <HStack gap={3}>
                <Text fontSize="sm" color="teal.500">
                  ➕
                </Text>
                <Text fontSize="sm" color="white">
                  New Team
                </Text>
              </HStack>
            </MenuItem>
          </Box>
        </MenuList>
      </Menu>
      <CreateTeamDialog isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
    </>
  );
}

