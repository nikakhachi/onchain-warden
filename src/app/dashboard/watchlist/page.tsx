"use client";

import { Box, Container, Heading, Button, HStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { UserTasks } from "../../components/UserTasks";

export default function WatchlistPage() {
  const router = useRouter();

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="6xl">
        <HStack justifyContent="space-between" alignItems="center" marginBottom={8}>
          <Heading as="h1" size="xl" color="white">
            Watchlist
          </Heading>
          <Button
            colorScheme="blue"
            onClick={() => router.push("/dashboard/create-watcher")}
            backgroundColor="blue.500"
            color="white"
            _hover={{ backgroundColor: "blue.600" }}
          >
            + Create Watcher
          </Button>
        </HStack>
        <UserTasks />
      </Container>
    </Box>
  );
}



