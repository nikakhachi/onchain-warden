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
      <Box
        padding={8}
        textAlign="center"
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Text color="gray.400">Connect your wallet to view your tasks</Text>
      </Box>
    );
  }

  if (userTasks === undefined) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={12}
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Spinner size="xl" color="blue.400" />
      </Box>
    );
  }

  if (userTasks.length === 0) {
    return (
      <Box
        padding={8}
        textAlign="center"
        borderRadius="lg"
        backgroundColor="gray.800"
        borderWidth="1px"
        borderColor="gray.700"
      >
        <Text color="gray.400" fontSize="lg">
          You haven't created any tasks yet
        </Text>
        <Text color="gray.500" fontSize="sm" marginTop={2}>
          Create your first event subscription below
        </Text>
      </Box>
    );
  }

  return (
    <Box className={className}>
      <Heading as="h2" size="xl" marginBottom={8} color="white">
        My Tasks ({userTasks.length})
      </Heading>
      <VStack align="stretch" gap={4}>
        {userTasks.map((item, index) => {
          const { task, eventSubscription, taskDefinition, chain } = item;
          return (
            <Box
              key={task._id}
              padding={6}
              borderRadius="lg"
              borderWidth="1px"
              borderColor="gray.700"
              backgroundColor="gray.800"
              boxShadow="sm"
              transition="all 0.3s"
              _hover={{
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
                borderColor: "blue.500",
                transform: "translateY(-2px)",
              }}
            >
              <HStack marginBottom={4} flexWrap="wrap" gap={3}>
                <Badge
                  colorPalette="blue"
                  fontSize="sm"
                  paddingX={3}
                  paddingY={1}
                  backgroundColor="blue.500"
                  color="white"
                >
                  {taskDefinition.name}
                </Badge>
                {chain && (
                  <Badge
                    colorPalette="green"
                    fontSize="sm"
                    paddingX={3}
                    paddingY={1}
                    backgroundColor="green.500"
                    color="white"
                  >
                    {chain.name}
                  </Badge>
                )}
                <Text fontSize="xs" color="gray.400">
                  Last Block: {task.last_block.toLocaleString()}
                </Text>
              </HStack>

              <VStack align="stretch">
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.300"
                    marginBottom={2}
                  >
                    Contract Address
                  </Text>
                  <Text
                    fontSize="sm"
                    fontFamily="mono"
                    color="blue.400"
                    wordBreak="break-all"
                    backgroundColor="gray.900"
                    padding={2}
                    borderRadius="md"
                  >
                    {eventSubscription.contract_address}
                  </Text>
                </Box>

                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color="gray.300"
                    marginBottom={2}
                  >
                    Event ABI
                  </Text>
                  <Text
                    fontSize="xs"
                    fontFamily="mono"
                    color="gray.300"
                    backgroundColor="gray.900"
                    padding={3}
                    borderRadius="md"
                    wordBreak="break-all"
                    borderWidth="1px"
                    borderColor="gray.700"
                  >
                    {eventSubscription.event_abi}
                  </Text>
                </Box>

                {task.data && Object.keys(task.data).length > 0 && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="gray.300"
                      marginBottom={2}
                    >
                      Task Data
                    </Text>
                    <Text
                      fontSize="xs"
                      fontFamily="mono"
                      color="gray.300"
                      backgroundColor="gray.900"
                      padding={3}
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="gray.700"
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
