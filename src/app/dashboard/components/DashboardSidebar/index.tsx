"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import { SocialLink } from "@/app/components/SocialLink";
import { TeamSelector } from "./TeamSelector";
import { PlusSquareIcon, BellIcon, CalendarIcon, LinkIcon } from "@chakra-ui/icons";

const menuItems = [
  {
    label: "Create Alert",
    path: "/dashboard/create-alert",
    icon: PlusSquareIcon,
  },
  {
    label: "Alerts",
    path: "/dashboard/alerts",
    icon: BellIcon,
  },
  {
    label: "Integrations",
    path: "/dashboard/integrations",
    icon: LinkIcon,
  },
  {
    label: "Addresses",
    path: "/dashboard/addresses",
    icon: CalendarIcon,
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
      <VStack gap={4} alignItems="stretch" flex={1}>
        <TeamSelector />

        <VStack alignItems="stretch" gap={2}>
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
      </VStack>

      <VStack gap={3} alignItems="stretch">
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
