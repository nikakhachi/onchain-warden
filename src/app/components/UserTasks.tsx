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
  const { isConnected, address, userEventWatchers } = useWallet();

  if (!isConnected || !address) {
    return (
      <Box
        padding={8}
        textAlign="center"
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
      >
        <Text color="gray.400">Connect your wallet to view your tasks</Text>
      </Box>
    );
  }

  if (userEventWatchers === undefined) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={12}
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
      >
        <Spinner size="xl" color="blue.400" />
      </Box>
    );
  }

  if (userEventWatchers.length === 0) {
    return (
      <Box
        padding={8}
        textAlign="center"
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
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

  // Extract event name from ABI
  const getEventName = (abi: string) => {
    try {
      const match = abi.match(/event\s+(\w+)/);
      return match ? match[1] : "Unknown";
    } catch {
      return "Unknown";
    }
  };

  // Format conditions
  const formatConditions = (conditions: any[]) => {
    if (!conditions || conditions.length === 0) return "None";
    return conditions
      .map((c) => `${c.field} ${c.operator} ${c.value}`)
      .join(", ");
  };

  // Get chain icon
  const getChainIcon = (chainName: string) => {
    const icons: Record<string, string> = {
      Ethereum: "💎",
      Polygon: "🟣",
      Arbitrum: "🔵",
      Base: "🔷",
    };
    return icons[chainName] || "⛓️";
  };

  return (
    <Box className={className}>
      <Box
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
        overflow="hidden"
      >
        {/* Table Header */}
        <Box
          display="grid"
          gridTemplateColumns="2fr 1fr 1fr 2fr 1fr 1fr"
          paddingX={6}
          paddingY={4}
          borderBottomWidth="1px"
          borderBottomColor="gray.800"
          backgroundColor="gray.900"
        >
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Watcher
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Chain
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Event
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Conditions
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Integrations
          </Text>
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Status
          </Text>
        </Box>

        {/* Table Body */}
        <VStack gap={0} alignItems="stretch">
          {userEventWatchers.map((item) => {
            const { eventWatcher, ownerIntegrations, chain } = item;
            const eventName = getEventName(eventWatcher.event_abi);
            const truncatedAddress = `${eventWatcher.contract_address.slice(0, 6)}...${eventWatcher.contract_address.slice(-4)}`;
            const conditions = eventWatcher.condition || [];
            const formattedConditions = formatConditions(conditions);
            const watcherLabel = eventWatcher.label || "Unnamed Watcher";

            return (
              <Box
                key={eventWatcher._id}
                display="grid"
                gridTemplateColumns="2fr 1fr 1fr 2fr 1fr 1fr"
                paddingX={6}
                paddingY={4}
                borderBottomWidth="1px"
                borderBottomColor="gray.800"
                _hover={{ backgroundColor: "gray.850" }}
                _last={{ borderBottomWidth: "0" }}
              >
                <Box>
                  <VStack alignItems="flex-start" gap={1}>
                    <Text color="white" fontWeight="medium">
                      {watcherLabel}
                    </Text>
                    <Text
                      fontFamily="mono"
                      color="gray.400"
                      fontSize="xs"
                    >
                      {truncatedAddress}
                    </Text>
                  </VStack>
                </Box>
                <Box>
                  <HStack gap={2}>
                    <Text fontSize="lg">
                      {chain ? getChainIcon(chain.name) : "⛓️"}
                    </Text>
                    <Text color="gray.300" fontSize="sm">
                      {chain?.name || "Unknown"}
                    </Text>
                  </HStack>
                </Box>
                <Box>
                  <Badge
                    backgroundColor="blue.500"
                    color="white"
                    paddingX={2}
                    paddingY={1}
                    borderRadius="md"
                    fontSize="xs"
                  >
                    {eventName}
                  </Badge>
                </Box>
                <Box>
                  <Text
                    color="gray.400"
                    fontSize="xs"
                    fontFamily="mono"
                    maxW="200px"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                  >
                    {formattedConditions}
                  </Text>
                </Box>
                <Box>
                  <HStack gap={1}>
                    {ownerIntegrations.map((integration: any, idx: number) => (
                      <Box
                        key={idx}
                        width="24px"
                        height="24px"
                        borderRadius="md"
                        backgroundColor="blue.500"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="sm"
                      >
                        💬
                      </Box>
                    ))}
                  </HStack>
                </Box>
                <Box>
                  <HStack justifyContent="space-between">
                    <Badge
                      backgroundColor="green.500"
                      color="white"
                      paddingX={2}
                      paddingY={1}
                      borderRadius="md"
                      fontSize="xs"
                    >
                      Active
                    </Badge>
                    <Box
                      as="button"
                      cursor="pointer"
                      padding={1}
                      borderRadius="md"
                      _hover={{ backgroundColor: "gray.800" }}
                    >
                      <Text fontSize="sm" color="gray.400">⋮</Text>
                    </Box>
                  </HStack>
                </Box>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
