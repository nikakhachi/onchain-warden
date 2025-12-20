"use client";

import {
  Box,
  Container,
  Heading,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { UserWatchers } from "./UserWatchers";
import { Button } from "../../components/Button";

export default function WatchlistPage() {
  const router = useRouter();

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <VStack alignItems="flex-start" gap={2} marginBottom={8}>
          <HStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <Heading as="h1" size="xl" color="white">
              Watchlist
            </Heading>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push("/dashboard/create-watcher")}
            >
              + Create Watcher
            </Button>
          </HStack>
          <Text color="gray.400" fontSize="sm">
            Manage your on-chain event watchers
          </Text>
        </VStack>
        <UserWatchers />
      </Container>
    </Box>
  );
}
