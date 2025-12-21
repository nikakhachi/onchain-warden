"use client";

import { Box, Container, Heading, Text, VStack, HStack } from "@chakra-ui/react";
import { CreateWatcherForm } from "./components/CreateWatcherForm";
import { CreateWatcherProvider, useCreateWatcher } from "./components/context/CreateWatcherContext";
import { ProgressStepper } from "./components/ProgressStepper";

function CreateWatcherPageContent() {
  const { currentStep } = useCreateWatcher();

  return (
    <>
      <HStack
        alignItems="flex-start"
        gap={8}
        marginBottom={8}
        width="100%"
      >
        <VStack alignItems="flex-start" gap={2} flexShrink={0}>
          <Heading as="h1" size="xl" color="white">
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
      <CreateWatcherForm />
    </>
  );
}

export default function CreateWatcherPage() {
  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <CreateWatcherProvider>
          <CreateWatcherPageContent />
        </CreateWatcherProvider>
      </Container>
    </Box>
  );
}
