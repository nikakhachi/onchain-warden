"use client";

import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { useWallet } from "@/app/providers/WalletContext";
import { Box, Text, VStack, HStack, Badge } from "@chakra-ui/react";

interface UserTasksProps {
  className?: string;
}

export function UserWatchers({ className }: UserTasksProps) {
  const { userEventWatchers } = useWallet();

  if (!userEventWatchers?.length) {
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
          You haven't created any watchers yet
        </Text>
        <Text color="gray.500" fontSize="sm" marginTop={2}>
          Create your first watcher below
        </Text>
      </Box>
    );
  }

  const getEventName = (abi: string) => {
    try {
      const match = abi.match(/event\s+(\w+)/);
      return match ? match[1] : "Unknown";
    } catch {
      return "Unknown";
    }
  };

  const formatConditions = (conditions: any[]) => {
    if (!conditions || conditions.length === 0) return "None";
    return conditions
      .map((c) => `${c.field} ${c.operator} ${c.value}`)
      .join(", ");
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
        </Box>

        <VStack gap={0} alignItems="stretch">
          {userEventWatchers.map((item) => {
            const { eventWatcher, integrations_data, chain } = item;
            const eventName = getEventName(eventWatcher.event_abi);
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
                  <Text color="white" fontWeight="medium">
                    {watcherLabel}
                  </Text>
                </Box>
                <Box>
                  <Text color="gray.300" fontSize="sm">
                    {chain?.name || "Unknown"}
                  </Text>
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
                    {integrations_data.map((item: any, idx: number) => (
                      <Box key={idx} width="24px" height="24px">
                        <IntegrationIcon name={item.integration.name} />
                      </Box>
                    ))}
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
