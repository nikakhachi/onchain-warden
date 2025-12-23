"use client";

import { Box, Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { UserWatchers } from "./UserWatchers";
import { DashboardPageHeader } from "../components/DashboardPageHeader";

export default function WatchlistPage() {
  const router = useRouter();

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader
          title="My Alerts"
          description="Manage your on-chain event alerts"
          buttonLabel="+ Create Alert"
          onClick={() => router.push("/dashboard/create-alert")}
        />
        <UserWatchers />
      </Container>
    </Box>
  );
}
