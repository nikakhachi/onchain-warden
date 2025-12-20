"use client";

import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { EventSubscriptionForm } from "../../components/CreateWatcher";

export default function CreateWatcherPage() {
  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <VStack alignItems="flex-start" gap={2} marginBottom={8}>
          <Heading as="h1" size="xl" color="white">
            Create Watcher
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Set up real-time notifications for on-chain events
          </Text>
        </VStack>
        <EventSubscriptionForm />
      </Container>
    </Box>
  );
}
