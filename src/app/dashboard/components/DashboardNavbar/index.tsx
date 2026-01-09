"use client";

import { Box, HStack, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { OnchainWatcherIcon } from "@/app/icons/OnchainWatcherIcon";
import { useAuth } from "@/app/providers/AuthContext";
import { AccountSection } from "./AccountSection";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/Button";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export function DashboardNavbar() {
  const { currentUser } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isDashboardRootOrSignIn = pathname === "/dashboard" || pathname === "/dashboard/signin";

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
          <Link href={isDashboardRootOrSignIn ? "/" : ""} style={{ textDecoration: "none" }}>
            <HStack gap={2} alignItems="center">
              <OnchainWatcherIcon width="40px" height="40px" />
              <Heading as="h1" fontSize="xl" color="white" fontWeight="600">
                Onchain Warden
              </Heading>
            </HStack>
          </Link>

          {currentUser && (
            <HStack gap={4} alignItems="center">
              <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/pricing")}>
                🌟 Upgrade
              </Button>
              <AccountSection />
            </HStack>
          )}
        </HStack>
      </Box>
    </>
  );
}
