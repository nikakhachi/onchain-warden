"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Box,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
  Container,
  VStack,
} from "@chakra-ui/react";

interface MetricCardProps {
  title: string;
  value: number;
  icon?: string;
  colorScheme?: string;
}

function MetricCard({
  title,
  value,
  icon,
  colorScheme = "blue",
}: MetricCardProps) {
  const colorMap: Record<
    string,
    { bg: string; border: string; text: string; icon: string }
  > = {
    blue: {
      bg: "rgba(59, 130, 246, 0.1)",
      border: "blue.500",
      text: "blue.400",
      icon: "blue.300",
    },
    green: {
      bg: "rgba(34, 197, 94, 0.1)",
      border: "green.500",
      text: "green.400",
      icon: "green.300",
    },
    purple: {
      bg: "rgba(168, 85, 247, 0.1)",
      border: "purple.500",
      text: "purple.400",
      icon: "purple.300",
    },
    orange: {
      bg: "rgba(249, 115, 22, 0.1)",
      border: "orange.500",
      text: "orange.400",
      icon: "orange.300",
    },
  };

  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Box
      padding={6}
      borderRadius="lg"
      backgroundColor={colors.bg}
      borderColor={colors.border}
      borderWidth="1px"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
        transform: "translateY(-4px)",
        borderColor: colors.border,
      }}
    >
      {icon && (
        <Text fontSize="3xl" marginBottom={3} color={colors.icon}>
          {icon}
        </Text>
      )}
      <Text
        fontSize="4xl"
        fontWeight="bold"
        color={colors.text}
        marginBottom={2}
      >
        {value.toLocaleString()}
      </Text>
      <Text fontSize="sm" color="gray.400" fontWeight="medium">
        {title}
      </Text>
    </Box>
  );
}

export function Metrics() {
  const metrics = useQuery(api.metrics.getMetrics);

  if (metrics === undefined) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={8}
      >
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.900">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="2xl" color="white">
              Platform Metrics
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Real-time statistics from our network
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} width="100%">
            <MetricCard
              title="Total Chains"
              value={metrics.totalChains}
              icon="⛓️"
              colorScheme="blue"
            />
            <MetricCard
              title="Contracts Monitored"
              value={metrics.totalContractsListened}
              icon="📡"
              colorScheme="green"
            />
            <MetricCard
              title="Events Tracked"
              value={metrics.totalEventsListened}
              icon="📊"
              colorScheme="purple"
            />
            <MetricCard
              title="Active Tasks"
              value={metrics.totalWatchers}
              icon="⚡"
              colorScheme="orange"
            />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
