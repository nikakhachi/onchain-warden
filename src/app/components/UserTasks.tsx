"use client";

import { useWallet } from "../providers/WalletContext";
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Spinner,
} from "@chakra-ui/react";

interface UserTasksProps {
  className?: string;
}

export function UserTasks({ className }: UserTasksProps) {
  const { isConnected, address, userTasks } = useWallet();

  if (!isConnected || !address) {
    return (
      <Box padding={6} textAlign="center">
        <Text color="gray.500">Connect your wallet to view your tasks</Text>
      </Box>
    );
  }

  if (userTasks === undefined) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={8}
      >
        <Spinner size="lg" />
      </Box>
    );
  }

  if (userTasks.length === 0) {
    return (
      <Box padding={6} textAlign="center">
        <Text color="gray.500">You haven't created any tasks yet</Text>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Heading as="h2" size="lg" marginBottom={6}>
        My Tasks ({userTasks.length})
      </Heading>
      <VStack align="stretch">
        {userTasks.map((item, index) => {
          const { task, eventSubscription, taskDefinition, chain } = item;
          return (
            <Box
              key={task._id}
              padding={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.200"
              backgroundColor="white"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{
                boxShadow: "md",
                borderColor: "blue.300",
              }}
            >
              <HStack marginBottom={4} flexWrap="wrap">
                <Badge
                  colorPalette="blue"
                  fontSize="sm"
                  paddingX={2}
                  paddingY={1}
                >
                  {taskDefinition.name}
                </Badge>
                {chain && (
                  <Badge
                    colorPalette="green"
                    fontSize="sm"
                    paddingX={2}
                    paddingY={1}
                  >
                    {chain.name}
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.500">
                  Last Block: {task.last_block.toLocaleString()}
                </Text>
              </HStack>

              <VStack align="stretch">
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.600"
                    marginBottom={1}
                  >
                    Contract Address
                  </Text>
                  <Text
                    fontSize="sm"
                    fontFamily="mono"
                    color="gray.800"
                    wordBreak="break-all"
                  >
                    {eventSubscription.contract_address}
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.600"
                    marginBottom={1}
                  >
                    Event ABI
                  </Text>
                  <Text
                    fontSize="xs"
                    fontFamily="mono"
                    color="gray.700"
                    backgroundColor="gray.50"
                    padding={2}
                    borderRadius="md"
                    wordBreak="break-all"
                  >
                    {eventSubscription.event_abi}
                  </Text>
                </Box>

                {task.data && Object.keys(task.data).length > 0 && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.600"
                      marginBottom={1}
                    >
                      Task Data
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="mono"
                      color="gray.700"
                      backgroundColor="gray.50"
                      padding={2}
                      borderRadius="md"
                    >
                      {JSON.stringify(task.data, null, 2)}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}
