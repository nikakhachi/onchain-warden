"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Box,
  Grid,
  Heading,
  Text,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react";

interface MetricCardProps {
  title: string;
  value: number;
  icon?: string;
  colorScheme?: string;
}

function MetricCard({ title, value, icon, colorScheme = "blue" }: MetricCardProps) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: {
      bg: "blue.50",
      border: "blue.200",
      text: "blue.700",
    },
    green: {
      bg: "green.50",
      border: "green.200",
      text: "green.700",
    },
    purple: {
      bg: "purple.50",
      border: "purple.200",
      text: "purple.700",
    },
    orange: {
      bg: "orange.50",
      border: "orange.200",
      text: "orange.700",
    },
  };

  const colors = colorMap[colorScheme] || colorMap.blue;

  return (
    <Box
      padding={6}
      borderRadius="lg"
      backgroundColor={colors.bg}
      borderColor={colors.border}
      borderWidth="2px"
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{
        boxShadow: "md",
        transform: "translateY(-2px)",
      }}
    >
      {icon && (
        <Text fontSize="2xl" marginBottom={2}>
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
      <Text fontSize="sm" color="gray.600" fontWeight="medium">
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
    <Box marginBottom={8}>
      <Heading as="h2" size="lg" marginBottom={6}>
        Platform Metrics
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
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
          value={metrics.totalTasks}
          icon="⚡"
          colorScheme="orange"
        />
      </SimpleGrid>
    </Box>
  );
}

