"use client";

import { usePathname, useRouter } from "next/navigation";
import { Box, VStack, HStack, Text, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { GRADIENTS } from "../theme";

const menuItems = [
  {
    label: "Create Watcher",
    path: "/dashboard/create-watcher",
    icon: "👁",
  },
  {
    label: "Watchlist",
    path: "/dashboard/watchlist",
    icon: "☑",
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
      display="flex"
      flexDirection="column"
      flexShrink={0}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <HStack gap={3} alignItems="center" marginBottom={8}>
          <Box
            width="40px"
            height="40px"
            borderRadius="lg"
            background={GRADIENTS.primaryDiagonal}
            borderWidth="1px"
            borderColor="gray.700"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xl"
            color="white"
          >
            ⚡
          </Box>
          <Heading
            as="h1"
            size="md"
            color="white"
            fontWeight="600"
          >
            ChainAlert
          </Heading>
        </HStack>
      </Link>

      {/* Navigation Items */}
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
              backgroundColor={isActive ? "rgba(6, 182, 212, 0.15)" : "transparent"}
              borderWidth={isActive ? "1px" : "0"}
              borderColor={isActive ? "cyan.400" : "transparent"}
              color={isActive ? "white" : "gray.400"}
              transition="all 0.2s"
              _hover={{
                backgroundColor: isActive ? "rgba(6, 182, 212, 0.2)" : "gray.800",
                color: "white",
              }}
              cursor="pointer"
            >
              <Text marginRight={3} fontSize="lg">
                {item.icon}
              </Text>
              <Text fontWeight={isActive ? "600" : "normal"} fontSize="sm">
                {item.label}
              </Text>
            </Box>
          );
        })}
      </VStack>

      {/* Collapse Button */}
      <Box
        as="button"
        display="flex"
        alignItems="center"
        justifyContent="center"
        paddingY={3}
        color="gray.400"
        fontSize="sm"
        _hover={{ color: "white" }}
        transition="color 0.2s"
        cursor="pointer"
        marginTop="auto"
      >
        <Text marginRight={2}>‹</Text>
        <Text>Collapse</Text>
      </Box>
    </Box>
  );
}
