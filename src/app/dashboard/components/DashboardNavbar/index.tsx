"use client";

import { Box, HStack, Heading, Text, Badge, Progress } from "@chakra-ui/react";
import Link from "next/link";
import { OnchainWatcherIcon } from "@/app/icons/OnchainWatcherIcon";
import { useAuth } from "@/app/providers/AuthContext";
import { AccountSection } from "./AccountSection";
import { usePathname } from "next/navigation";
import { useUser } from "@/app/providers/UserContext";
import { ICON_COLORS } from "@/app/theme";

export function DashboardNavbar() {
  const { currentUser } = useAuth();
  const { userSubscription, watchers, selectedTeam } = useUser();
  const pathname = usePathname();

  const isDashboardRootOrSignIn = pathname === "/dashboard" || pathname === "/dashboard/signin";

  const currentAlerts = watchers?.length || 0;
  const maxAlerts = selectedTeam?.alert_limit || 5;

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
            <HStack justifyContent="space-between" alignItems="center" gap={4}>
              {userSubscription && (
                <Badge
                  paddingX={2}
                  paddingY={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="600"
                  backgroundColor={
                    userSubscription === "Free"
                      ? "gray.600"
                      : userSubscription === "Solo"
                        ? ICON_COLORS.purple
                        : userSubscription === "Team"
                          ? ICON_COLORS.blue
                          : userSubscription === "Solo & Team"
                            ? ICON_COLORS.cyan
                            : "transparent"
                  }
                  color="white"
                  textTransform="none"
                >
                  {userSubscription === "Free" ? "Free Plan" : `${userSubscription?.toUpperCase()} PLAN`}
                </Badge>
              )}

              <Box
                paddingX={3}
                paddingY={1}
                backgroundColor="gray.800"
                borderRadius="full"
                borderWidth="1px"
                borderColor="gray.700"
              >
                <HStack gap={3} alignItems="center">
                  <Text color="white" fontSize="sm" fontWeight="400">
                    <Text as="span" fontWeight="600">
                      {selectedTeam?.name}
                    </Text>{" "}
                    Alerts
                  </Text>
                  <Text color="white" fontSize="sm" fontWeight="600">
                    {currentAlerts}/{maxAlerts}
                  </Text>
                  <Progress
                    value={(currentAlerts / maxAlerts) * 100}
                    backgroundColor="gray.700"
                    borderRadius="full"
                    height="8px"
                    width="80px"
                    flexShrink={0}
                    sx={{ "& > div": { background: ICON_COLORS.cyan, borderRadius: "full" } }}
                  />
                </HStack>
              </Box>

              <AccountSection />
            </HStack>
          )}
        </HStack>
      </Box>
    </>
  );
}
