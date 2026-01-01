"use client";

import { useState } from "react";
import { Box, HStack, Text, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { CreateTeamDialog } from "./CreateTeamDialog";
import { useUser } from "@/app/providers/UserContext";
import { GRADIENTS } from "@/app/theme";
import { ChevronDownIcon, AddIcon } from "@chakra-ui/icons";

const getTeamInitial = (name: string): string => name.charAt(0).toUpperCase();

export function TeamSelector() {
  const { teams, currentTeamId, switchTeam } = useUser();

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  const currentTeam = teams?.find((t) => t._id === currentTeamId);

  return (
    <>
      <Menu>
        <MenuButton
          backgroundColor="gray.900"
          color="white"
          transition="all 0.2s"
          _hover={{ backgroundColor: "gray.800" }}
          _expanded={{ backgroundColor: "gray.800" }}
          width="100%"
          borderBottom="1px"
          borderColor="gray.700"
          px={4}
          py={3}
        >
          <HStack gap={3} flex={1}>
            <Box
              width="32px"
              height="32px"
              borderRadius="full"
              background={GRADIENTS.primaryDiagonalReverse}
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight="600"
            >
              {getTeamInitial(currentTeam?.name || "T")}
            </Box>
            <Text fontSize="sm" fontWeight="500" flex={1} textAlign="left" noOfLines={1}>
              {currentTeam?.name}
            </Text>
            <ChevronDownIcon />
          </HStack>
        </MenuButton>
        <MenuList py={0} px={0} backgroundColor="gray.800" borderColor="gray.700" borderWidth="1px" minWidth="200px">
          {teams?.map((team) => (
            <MenuItem
              key={team._id}
              onClick={() => switchTeam(team._id)}
              backgroundColor={currentTeamId === team._id ? "gray.700" : "transparent"}
              _hover={{
                backgroundColor: "gray.700",
              }}
              paddingX={3}
              paddingY={2}
            >
              <HStack gap={3} width="100%">
                <Box
                  width="24px"
                  height="24px"
                  borderRadius="full"
                  background={GRADIENTS.primaryDiagonal}
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
              </HStack>
            </MenuItem>
          ))}
          <Box borderTopWidth="1px" borderTopColor="gray.800" m={0}>
            <MenuItem
              onClick={() => setIsCreateTeamOpen(true)}
              _hover={{
                backgroundColor: "gray.700",
              }}
              paddingX={3}
              paddingY={2}
              backgroundColor="gray.800"
            >
              <HStack gap={3}>
                <AddIcon color="blue.500" />
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
