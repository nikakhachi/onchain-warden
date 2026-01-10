"use client";

import { Box, HStack, Heading, Text, Badge } from "@chakra-ui/react";
import Link from "next/link";
import { OnchainWatcherIcon } from "@/app/icons/OnchainWatcherIcon";
import { useAuth } from "@/app/providers/AuthContext";
import { AccountSection } from "./AccountSection";
import { usePathname } from "next/navigation";
import { Button } from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/providers/UserContext";
import { ICON_COLORS } from "@/app/theme";

export function DashboardNavbar() {
  const { currentUser } = useAuth();
  const { userSubscription } = useUser();
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
              {userSubscription === "Free" || userSubscription === "Team Member" ? (
                <Button variant="secondary" size="sm" onClick={() => router.push("/dashboard/pricing")}>
                  🌟 Upgrade
                </Button>
              ) : (
                <HStack gap={2} alignItems="center">
                  <Badge
                    paddingX={3}
                    paddingY={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="none"
                    backgroundColor={
                      userSubscription === "Solo"
                        ? ICON_COLORS.purple
                        : userSubscription === "Team"
                          ? ICON_COLORS.blue
                          : userSubscription === "Solo & Team"
                            ? ICON_COLORS.cyan
                            : ICON_COLORS.green
                    }
                    color="white"
                  >
                    🌟 {userSubscription?.toUpperCase()}
                  </Badge>
                </HStack>
              )}

              <AccountSection />
            </HStack>
          )}
        </HStack>
      </Box>
    </>
  );
}
