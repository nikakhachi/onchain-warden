"use client";

import { Box, Container, HStack } from "@chakra-ui/react";
import { CreateWatcherForm } from "./components/CreateWatcherForm";
import { CreateWatcherProvider, useCreateWatcher } from "./components/context/CreateWatcherContext";
import { ProgressStepper } from "./components/ProgressStepper";
import { DashboardPageHeader } from "../components/DashboardPageHeader";

function CreateWatcherPageContent() {
  const { currentStep } = useCreateWatcher();

  return (
    <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
      <HStack alignItems="flex-start" gap={8} marginBottom={6} width="100%" flexShrink={0}>
        <Box flexShrink={0}>
          <DashboardPageHeader
            title="Create Alert"
            description="Set up real-time notifications for on-chain events"
            marginBottom={0}
          />
        </Box>
        <Box flex={1} minWidth={0}>
          <ProgressStepper currentStep={currentStep} />
        </Box>
      </HStack>
      <Box flex={1} minHeight={0}>
        <CreateWatcherForm />
      </Box>
    </Box>
  );
}

export default function CreateWatcherPage() {
  return (
    <Box flex={1} display="flex" flexDirection="column" height="calc(100vh - 80px)" paddingY={8} overflow="hidden">
      <Container maxW="8xl" flex={1} display="flex" flexDirection="column" minHeight={0}>
        <CreateWatcherProvider>
          <CreateWatcherPageContent />
        </CreateWatcherProvider>
      </Container>
    </Box>
  );
}
