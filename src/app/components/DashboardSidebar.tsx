"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, VStack, Text, HStack } from "@chakra-ui/react";
import Link from "next/link";

const menuItems = [
  {
    label: "Create Watcher",
    path: "/dashboard/create-watcher",
  },
  {
    label: "Watchlist",
    path: "/dashboard/watchlist",
  },
  {
    label: "Integrations",
    path: "/dashboard/integrations",
  },
  {
    label: "Addresses",
    path: "/dashboard/addresses",
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
      padding={4}
      height="calc(100vh - 80px)"
      display="flex"
      flexDirection="column"
      flexShrink={0}
    >
      <VStack gap={2} alignItems="stretch" flex={1}>
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
              paddingX={4}
              paddingY={3}
              borderRadius="lg"
              backgroundColor={
                isActive ? "rgba(59, 130, 246, 0.15)" : "transparent"
              }
              borderWidth={isActive ? "1px" : "0"}
              borderColor={isActive ? "blue.500" : "transparent"}
              color={isActive ? "white" : "gray.400"}
              transition="all 0.2s"
              _hover={{
                backgroundColor: isActive
                  ? "rgba(59, 130, 246, 0.2)"
                  : "gray.800",
                color: "white",
              }}
              cursor="pointer"
            >
              <Text fontWeight={isActive ? "600" : "normal"} fontSize="sm">
                {item.label}
              </Text>
            </Box>
          );
        })}
      </VStack>

      <VStack gap={3} alignItems="stretch">
        <Text color="gray.400" fontSize="xs" textAlign="center">
          © 2025 Onchain Warden. All rights reserved.
        </Text>

        <HStack gap={2} justifyContent="center">
          <Link
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Box
              width="32px"
              height="32px"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.700"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ borderColor: "gray.600" }}
              transition="border-color 0.2s"
              cursor="pointer"
            >
              <Text fontSize="md" color="white">
                💬
              </Text>
            </Box>
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Box
              width="32px"
              height="32px"
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.700"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ borderColor: "gray.600" }}
              transition="border-color 0.2s"
              cursor="pointer"
            >
              <Text fontSize="md" color="white">
                🐦
              </Text>
            </Box>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
}
