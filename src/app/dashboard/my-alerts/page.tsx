"use client";

import { Box, Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { UserWatchers } from "./UserWatchers";
import { DashboardPageHeader } from "../components/DashboardPageHeader";

export default function WatchlistPage() {
  const router = useRouter();

  return (
    <Box flex={1} display="flex" flexDirection="column" height="calc(100vh - 80px)" overflow="hidden" paddingY={8}>
      <Container maxW="8xl" flex={1} display="flex" flexDirection="column" minHeight={0}>
        <Box flexShrink={0}>
          <DashboardPageHeader
            title="My Alerts"
            description="Manage your on-chain event alerts"
            buttonLabel="+ Create Alert"
            onClick={() => router.push("/dashboard/create-alert")}
          />
        </Box>
        <Box flex={1} minHeight={0} overflowY="auto">
          <UserWatchers />
        </Box>
      </Container>
    </Box>
  );
}
