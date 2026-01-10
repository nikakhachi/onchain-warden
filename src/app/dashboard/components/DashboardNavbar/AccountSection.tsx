"use client";

import { useRouter } from "next/navigation";
import { HStack, Text, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { useAuth } from "@/app/providers/AuthContext";
import { ICON_COLORS } from "@/app/theme";
import { MdLogout } from "react-icons/md";
import { TiArrowSortedDown } from "react-icons/ti";
import { accountItems } from "../DashboardSidebar";

const LocalMenuItem = ({ onClick, icon, text }: { onClick: () => void; icon: React.ReactNode; text: string }) => (
  <MenuItem
    onClick={onClick}
    _hover={{
      backgroundColor: "gray.800",
    }}
    paddingX={3}
    paddingY={3}
    backgroundColor="gray.900"
    color={text === "Log Out" ? ICON_COLORS.rose : "white"}
  >
    <HStack gap={3}>
      {icon}
      <Text fontSize="sm">{text}</Text>
    </HStack>
  </MenuItem>
);

export function AccountSection() {
  const { logout, currentUser } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/dashboard/signin");
  };

  return (
    <Menu placement="bottom-end">
      <MenuButton
        display="flex"
        alignItems="center"
        gap={2}
        paddingX={4}
        paddingY={1}
        borderRadius="md"
        color="white"
        transition="all 0.2s"
        _hover={{ backgroundColor: "gray.900" }}
        _expanded={{ backgroundColor: "gray.900" }}
        cursor="pointer"
      >
        <HStack>
          <Text fontSize="md" fontWeight="500" color="white" noOfLines={1}>
            {currentUser?.username}
          </Text>
          <TiArrowSortedDown />
        </HStack>
      </MenuButton>
      <MenuList backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" minWidth="200px" p={0}>
        {accountItems.map((item) => (
          <LocalMenuItem
            key={item.path}
            onClick={() => router.push(item.path)}
            icon={<item.icon />}
            text={item.label}
          />
        ))}
        <LocalMenuItem onClick={handleLogout} icon={<MdLogout />} text="Log Out" />
      </MenuList>
    </Menu>
  );
}
