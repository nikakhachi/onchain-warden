"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HStack, Text, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { AccountSettingsDialog } from "./AccountSettingsDialog";
import { useWallet } from "../../providers/WalletContext";
import { NotAllowedIcon, SettingsIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ICON_COLORS } from "@/app/theme";

interface AccountSectionProps {
  username: string;
  walletAddress: string;
}

export function AccountSection({ username, walletAddress }: AccountSectionProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { logout } = useWallet();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/dashboard");
  };

  return (
    <>
      <Menu placement="bottom-end">
        <MenuButton
          display="flex"
          alignItems="center"
          gap={2}
          paddingX={4}
          paddingY={2}
          borderRadius="md"
          color="white"
          transition="all 0.2s"
          _hover={{ backgroundColor: "gray.900" }}
          _expanded={{ backgroundColor: "gray.900" }}
          cursor="pointer"
        >
          <HStack>
            <Text fontSize="md" fontWeight="500" color="white" noOfLines={1}>
              {username}
            </Text>
            <ChevronDownIcon color={ICON_COLORS.purple} />
          </HStack>
        </MenuButton>
        <MenuList backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" minWidth="200px">
          <MenuItem
            onClick={() => setIsSettingsOpen(true)}
            _hover={{
              backgroundColor: "gray.800",
            }}
            paddingX={3}
            paddingY={2}
            backgroundColor="gray.900"
            color="white"
          >
            <HStack gap={3}>
              <SettingsIcon />
              <Text fontSize="sm">Account Settings</Text>
            </HStack>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            _hover={{
              backgroundColor: "gray.800",
            }}
            paddingX={3}
            paddingY={2}
            backgroundColor="gray.900"
            color="red.500"
          >
            <HStack gap={3}>
              <NotAllowedIcon />
              <Text fontSize="sm">Log Out</Text>
            </HStack>
          </MenuItem>
        </MenuList>
      </Menu>
      <AccountSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        username={username}
        walletAddress={walletAddress}
      />
    </>
  );
}
