"use client";

import { Box, Container } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { UserWatchers } from "./UserWatchers";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { useAuth } from "@/app/providers/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";
import { useUser } from "@/app/providers/UserContext";
export default function WatchlistPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { isLimitReached } = useUser();

  const handleCreateAlertClick = () => {
    if (isLimitReached) {
      router.push("/dashboard/pricing?highlight=solo");
    } else {
      router.push("/dashboard/create-alert");
    }
  };

  if (!currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} display="flex" flexDirection="column" height="calc(100vh - 80px)" overflow="hidden" paddingY={8}>
      <Container maxW="8xl" flex={1} display="flex" flexDirection="column" minHeight={0}>
        <Box flexShrink={0}>
          <DashboardPageHeader
            title="Alerts"
            description="Manage your on-chain event alerts"
            buttonLabel="+ Create Alert"
            onClick={handleCreateAlertClick}
          />
        </Box>
        <Box flex={1} minHeight={0} overflowY="auto">
          <UserWatchers />
        </Box>
      </Container>
    </Box>
  );
}
