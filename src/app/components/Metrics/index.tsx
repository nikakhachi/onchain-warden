"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GRADIENTS } from "../../theme";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";
import { MetricCard } from "./MetricCard";

export function Metrics() {
  const metrics = useQuery(api.metrics.getMetrics);

  if (!metrics) return null;

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="metrics">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading
              as="h2"
              size="4xl"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="700"
              color="white"
            >
              Monitor On-Chain,{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                Simplified
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Powerful features to track blockchain events without the
              complexity.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
            <MetricCard
              icon="🔔"
              value={metrics.totalChains}
              title="Real-Time Alerts"
              description="Get notified instantly when your alerts are triggered. No delays, no missed opportunities."
            />
            <MetricCard
              icon="💻"
              value={metrics.totalContractsListened}
              title="No-Code Setup"
              description="Use pre-built templates or create custom alerts with ease. No coding knowledge required."
            />
            <MetricCard
              icon="🔀"
              value={metrics.totalEventsListened}
              title="Flexibility"
              description="Set up thresholds, filters, and customized notifications for any alert."
            />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
