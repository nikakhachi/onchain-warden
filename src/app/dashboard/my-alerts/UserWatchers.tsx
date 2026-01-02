"use client";

import { IntegrationIcon } from "@/app/icons/IntegrationIcon";
import { useUser } from "@/app/providers/UserContext";
import { Box, Text, VStack, HStack, Badge, Tooltip, Link } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/Button";
import { WatcherMenu } from "./WatcherMenu";
import { GRADIENTS } from "@/app/theme";
import { ChainIcon } from "@/app/icons/ChainIcon";
import { formatAddress } from "@/app/helpers";
import { CHAIN_ID_TO_EXPLORER } from "../../../../convex/viem";

interface UserTasksProps {
  className?: string;
}

export function UserWatchers({ className }: UserTasksProps) {
  const { watchers, chains, watcherIntegrations, teamIntegrations, integrations, getAddedByUsername } = useUser();
  const router = useRouter();

  if (!watchers?.length) {
    return (
      <Box
        padding={8}
        textAlign="center"
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
      >
        <Text color="gray.400" marginBottom={4}>
          You haven't created any alerts yet
        </Text>
        <Button variant="primary" size="md" onClick={() => router.push("/dashboard/create-alert")}>
          Create Your First Alert
        </Button>
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
    return conditions.map((c) => `${c.field} ${c.operator} ${c.value}`).join(", ");
  };

  return (
    <Box className={className} height="100%" display="flex" flexDirection="column">
      <Box
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <Box
          display="grid"
          gridTemplateColumns="1.5fr 0.4fr 1.2fr 2fr 1fr 0.8fr 0.5fr"
          paddingX={6}
          paddingY={4}
          borderBottomWidth="1px"
          borderBottomColor="gray.800"
          backgroundColor="gray.900"
          alignItems="center"
          flexShrink={0}
        >
          <Text color="gray.400" fontSize="sm" fontWeight="semibold">
            Label
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
            Added by
          </Text>
          <Box display="flex" justifyContent="flex-end">
            <Text color="gray.400" fontSize="sm" fontWeight="semibold">
              Actions
            </Text>
          </Box>
        </Box>

        <Box flex={1} overflowY="auto" minHeight={0}>
          <VStack gap={0} alignItems="stretch">
            {chains &&
              watcherIntegrations &&
              teamIntegrations &&
              integrations &&
              watchers.map((eventWatcher) => {
                const eventName = getEventName(eventWatcher.event_abi);
                const conditions = eventWatcher.condition || [];
                const formattedConditions = formatConditions(conditions);
                const watcherLabel = eventWatcher.label || "Unnamed Alert";

                const chain = chains.find((chain) => chain._id === eventWatcher.chain_convex_id)!;
                const _integrations = watcherIntegrations
                  .filter((item) => item.event_watcher_id === eventWatcher._id)
                  .map(
                    (watcherIntegration) =>
                      teamIntegrations.find(
                        (teamIntegration) => teamIntegration._id === watcherIntegration.team_integration_id,
                      )!,
                  )
                  .map((item) => ({
                    label: item.label,
                    integration: integrations.find((integration) => integration._id === item.integration_id)!,
                  }));

                return (
                  <Box
                    key={eventWatcher._id}
                    display="grid"
                    gridTemplateColumns="1.5fr 0.4fr 1.2fr 2fr 1fr 0.8fr 0.5fr"
                    paddingX={6}
                    paddingY={4}
                    borderBottomWidth="1px"
                    borderBottomColor="gray.800"
                    _hover={{ backgroundColor: "gray.850" }}
                    _last={{ borderBottomWidth: "0" }}
                    alignItems="center"
                  >
                    <VStack alignItems="flex-start" gap={1}>
                      <Text color="white" fontWeight="medium">
                        {watcherLabel}
                      </Text>
                      <Tooltip label={eventWatcher.contract_address}>
                        <Link
                          href={`${CHAIN_ID_TO_EXPLORER[chain?.chain_id]}/address/${eventWatcher.contract_address}`}
                          isExternal
                          color="blue.400"
                          fontSize="xs"
                          fontWeight="medium"
                          _hover={{
                            color: "blue.300",
                            textDecoration: "underline",
                          }}
                          transition="color 0.2s"
                        >
                          {formatAddress(eventWatcher.contract_address)}
                        </Link>
                      </Tooltip>
                    </VStack>
                    <HStack>
                      <Box width="20px" height="20px">
                        <ChainIcon name={chain?.name} />
                      </Box>
                    </HStack>
                    <Box>
                      <Tooltip label={eventWatcher.event_abi}>
                        <Badge
                          background={GRADIENTS.primaryDiagonalReverse}
                          color="white"
                          paddingX={2}
                          paddingY={1}
                          borderRadius="md"
                          fontSize="xs"
                        >
                          {eventName}
                        </Badge>
                      </Tooltip>
                    </Box>
                    <Box>
                      <Tooltip label={formattedConditions}>
                        <Text
                          color="gray.400"
                          fontSize="xs"
                          maxW="300px"
                          textOverflow="ellipsis"
                          overflow="hidden"
                          whiteSpace="nowrap"
                        >
                          {formattedConditions}
                        </Text>
                      </Tooltip>
                    </Box>
                    <Box>
                      <HStack gap={1}>
                        {_integrations?.map((item, idx) => (
                          <Tooltip key={idx} label={item.label}>
                            <Box width="24px" height="24px">
                              <IntegrationIcon name={item.integration.name} />
                            </Box>
                          </Tooltip>
                        ))}
                      </HStack>
                    </Box>
                    <Box minWidth={0} overflow="hidden">
                      <Text
                        color="gray.400"
                        fontSize="sm"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {getAddedByUsername(eventWatcher.added_by)}
                      </Text>
                    </Box>
                    <Box minWidth={0} display="flex" justifyContent="flex-end">
                      <WatcherMenu watcherId={eventWatcher._id} watcher={{ eventWatcher, chain }} />
                    </Box>
                  </Box>
                );
              })}
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
