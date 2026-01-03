"use client";

import { Box, HStack, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { OnchainWatcherIcon } from "@/app/icons/OnchainWatcherIcon";
import { useWallet } from "@/app/providers/WalletContext";
import { AccountSection } from "./AccountSection";

export function DashboardNavbar() {
  const { hasValidToken, currentUser } = useWallet();

  return (
    <>
      <Box
        as="nav"
        position="sticky"
        top={0}
        zIndex={1000}
        borderBottomWidth="1px"
        borderBottomColor="gray.800"
        backdropFilter="blur(10px)"
        backgroundColor="gray.950"
      >
        <HStack paddingY={4} paddingX={6} justifyContent="space-between" alignItems="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <HStack gap={2} alignItems="center">
              <OnchainWatcherIcon width="40px" height="40px" />
              <Heading as="h1" fontSize="xl" color="white" fontWeight="600">
                Onchain Warden
              </Heading>
            </HStack>
          </Link>

          {hasValidToken && currentUser && (
            <HStack gap={4} alignItems="center">
              <AccountSection />
            </HStack>
          )}
        </HStack>
      </Box>
    </>
  );
}
