"use client";

import { Box, Container, VStack, Text } from "@chakra-ui/react";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { useAuth } from "@/app/providers/AuthContext";
import { LoadingScreen } from "../components/LoadingScreen";

export default function BillingPage() {
  const { currentUser } = useAuth();

  if (!currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} display="flex" flexDirection="column" height="calc(100vh - 80px)" overflow="hidden" paddingY={8}>
      <Container maxW="8xl" flex={1} display="flex" flexDirection="column" minHeight={0}>
        <Box flexShrink={0}>
          <DashboardPageHeader title="Billing" description="Manage your subscription and billing information" />
        </Box>
        <Box flex={1} minHeight={0} overflowY="auto" display="flex" alignItems="center" justifyContent="center">
          <VStack gap={4}>
            <Text color="gray.400" fontSize="lg">
              Billing page coming soon
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
}
