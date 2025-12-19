"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, VStack, Button, Text } from "@chakra-ui/react";

const menuItems = [
  {
    label: "Create Watcher",
    path: "/dashboard/create-watcher",
    icon: "➕",
  },
  {
    label: "Watchlist",
    path: "/dashboard/watchlist",
    icon: "📋",
  },
  {
    label: "Integrations",
    path: "/dashboard/integrations",
    icon: "🔗",
  },
  {
    label: "Addresses",
    path: "/dashboard/addresses",
    icon: "📍",
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
      padding={6}
      height="calc(100vh - 80px)"
      overflowY="auto"
      flexShrink={0}
    >
      <VStack gap={2} alignItems="stretch">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Button
              key={item.path}
              onClick={() => router.push(item.path)}
              justifyContent="flex-start"
              variant={isActive ? "solid" : "ghost"}
              colorScheme={isActive ? "blue" : "gray"}
              backgroundColor={isActive ? "blue.600" : "transparent"}
              color={isActive ? "white" : "gray.300"}
              _hover={{
                backgroundColor: isActive ? "blue.700" : "gray.800",
                color: isActive ? "white" : "white",
              }}
              paddingX={4}
              paddingY={3}
              height="auto"
            >
              <Text marginRight={3} fontSize="lg">
                {item.icon}
              </Text>
              <Text fontWeight={isActive ? "semibold" : "normal"}>
                {item.label}
              </Text>
            </Button>
          );
        })}
      </VStack>
    </Box>
  );
}
