"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { CreateWatcherForm } from "./components/CreateWatcherForm";
import {
  CreateWatcherProvider,
  useCreateWatcher,
} from "./components/context/CreateWatcherContext";
import { ProgressStepper } from "./components/ProgressStepper";

function CreateWatcherPageContent() {
  const { currentStep } = useCreateWatcher();

  return (
    <Box flex={1} display="flex" flexDirection="column" minHeight={0}>
      <HStack
        alignItems="flex-start"
        gap={8}
        marginBottom={6}
        width="100%"
        flexShrink={0}
      >
        <VStack alignItems="flex-start" gap={2} flexShrink={0}>
          <Heading as="h1" size="lg" color="white">
            Create Watcher
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Set up real-time notifications for on-chain events
          </Text>
        </VStack>
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
    <Box
      flex={1}
      display="flex"
      flexDirection="column"
      height="calc(100vh - 80px)"
      paddingY={6}
      paddingX={6}
      overflow="hidden"
    >
      <Container
        maxW="8xl"
        flex={1}
        display="flex"
        flexDirection="column"
        minHeight={0}
      >
        <CreateWatcherProvider>
          <CreateWatcherPageContent />
        </CreateWatcherProvider>
      </Container>
    </Box>
  );
}
