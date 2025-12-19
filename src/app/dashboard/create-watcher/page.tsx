"use client";

import { Box, Container, Heading } from "@chakra-ui/react";
import { EventSubscriptionForm } from "../../components/EventSubscriptionForm";

export default function CreateWatcherPage() {
  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="4xl">
        <Heading as="h1" size="xl" marginBottom={8} color="white">
          Create Event Watcher
        </Heading>
        <EventSubscriptionForm />
      </Container>
    </Box>
  );
}

