"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { SocialLink } from "@/app/components/SocialLink";
import { TeamSelector } from "./TeamSelector";
import { useAuth } from "@/app/providers/AuthContext";
import { Button } from "@/app/components/Button";
import { FaRegCreditCard, FaListUl } from "react-icons/fa6";
import { RiTeamFill } from "react-icons/ri";
import { IoSettingsSharp, IoNotificationsSharp } from "react-icons/io5";
import { IoMdAdd } from "react-icons/io";
import { AiFillNotification } from "react-icons/ai";

const menuItems = [
  {
    label: "Create Alert",
    path: "/dashboard/create-alert",
    icon: IoMdAdd,
  },
  {
    label: "Alerts",
    path: "/dashboard/alerts",
    icon: IoNotificationsSharp,
  },
  {
    label: "Integrations",
    path: "/dashboard/integrations",
    icon: AiFillNotification,
  },
  {
    label: "Addresses",
    path: "/dashboard/addresses",
    icon: FaListUl,
  },
];

export const accountItems = [
  {
    label: "Account Settings",
    path: "/dashboard/account",
    icon: IoSettingsSharp,
  },
  {
    label: "Manage Teams",
    path: "/dashboard/teams",
    icon: RiTeamFill,
  },
  {
    label: "Billing",
    path: "/dashboard/billing",
    icon: FaRegCreditCard,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isTeamsPage = pathname === "/dashboard/teams";
  const isAccountPage = pathname === "/dashboard/account";
  const isBillingPage = pathname === "/dashboard/billing";

  return (
    <Box
      width="250px"
      backgroundColor="gray.900"
      borderRightWidth="1px"
      borderRightColor="gray.800"
      height="calc(100vh - 80px)"
      display="flex"
      flexDirection="column"
      flexShrink={0}
      pb={6}
    >
      <VStack alignItems="stretch" flex={1}>
        <TeamSelector />

        <VStack alignItems="stretch" gap={0}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Box
                key={item.path}
                as="button"
                onClick={() => router.push(item.path)}
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                paddingX={6}
                paddingY={3}
                borderRadius="lg"
                backgroundColor={isActive ? "gray.800" : "transparent"}
                color={isActive ? "white" : "gray.400"}
                transition="all 0.2s"
                _hover={{ backgroundColor: "gray.800", color: "white" }}
                cursor="pointer"
                gap={2}
              >
                <item.icon color="gray.400" />
                <Text fontWeight={isActive ? "600" : "normal"} fontSize="sm">
                  {item.label}
                </Text>
              </Box>
            );
          })}
        </VStack>

        <VStack alignItems="stretch" gap={0} mt={2}>
          <Text
            color="gray.500"
            fontSize="xs"
            fontWeight="600"
            letterSpacing="wider"
            textTransform="uppercase"
            paddingX={6}
            paddingY={1}
            mb={1}
          >
            ACCOUNT
          </Text>
          {accountItems.map((item) => (
            <Box
              key={item.path}
              as="button"
              onClick={() => router.push(item.path)}
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              paddingX={6}
              paddingY={3}
              transition="all 0.2s"
              backgroundColor={pathname === item.path ? "gray.800" : "transparent"}
              color={pathname === item.path ? "white" : "gray.400"}
              _hover={{
                backgroundColor: pathname === item.path ? "rgba(59, 130, 246, 0.2)" : "gray.800",
                color: "white",
              }}
              cursor="pointer"
              gap={2}
            >
              <item.icon />
              <Text fontSize="sm">{item.label}</Text>
            </Box>
          ))}
        </VStack>
      </VStack>

      <VStack gap={3} alignItems="stretch">
        <HStack justifyContent="center" px={12} mb={3}>
          <Button
            variant="secondary"
            size="sm"
            onClick={logout}
            color="gray.400"
            backgroundColor="transparent"
            _hover={{
              backgroundColor: "red.900",
              color: "white",
              borderColor: "red.500",
            }}
            w="100%"
            outlined={true}
          >
            Log Out
          </Button>
        </HStack>

        <Text color="gray.400" fontSize="xs" textAlign="center">
          © 2026 Onchain Warden. All rights reserved.
        </Text>

        <HStack gap={2} justifyContent="center">
          <SocialLink label="X" />
          <SocialLink label="Discord" />
        </HStack>
      </VStack>
    </Box>
  );
}
