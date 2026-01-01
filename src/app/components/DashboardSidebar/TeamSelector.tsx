"use client";

import { useState } from "react";
import { Box, HStack, Text, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { useUser } from "@/app/providers/UserContext";

const getTeamInitial = (name: string): string => name.charAt(0).toUpperCase();

export function TeamSelector() {
  const { teams, currentTeamId, switchTeam } = useUser();

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const currentTeam = teams?.find((t) => t._id === currentTeamId);

  return (
    <>
      <Menu>
        <MenuButton
          p={2}
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
              {getTeamInitial(currentTeam?.name || "T")}
            </Box>
            <Text fontSize="sm" fontWeight="500" flex={1} textAlign="left" noOfLines={1}>
              {currentTeam?.name}
            </Text>
            <Text fontSize="sm" flexShrink={0}>
              ⬇
            </Text>
          </HStack>
        </MenuButton>
        <MenuList py={2} px={0} backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" minWidth="200px">
          <Box paddingBottom={2}>
            <Text fontSize="xs" color="gray.400" fontWeight="600" paddingX={2} paddingY={1} textTransform="uppercase">
              Switch Team
            </Text>
          </Box>
          {teams?.map((team) => (
            <MenuItem
              key={team._id}
              onClick={() => switchTeam(team._id)}
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
          <Box borderTopWidth="1px" borderTopColor="gray.800">
            <MenuItem
              onClick={() => setIsCreateTeamOpen(true)}
              _hover={{
                backgroundColor: "gray.800",
              }}
              paddingX={3}
              paddingY={2}
              backgroundColor="gray.900"
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
