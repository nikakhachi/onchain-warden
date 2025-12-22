"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
} from "@chakra-ui/react";
import { GRADIENTS, ICON_COLORS } from "../theme";
import { Card } from "./Card";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";

const MetricCard = ({
  icon,
  value,
  title,
  description,
}: {
  icon: string;
  value: number;
  title: string;
  description: string;
}) => (
  <Card>
    <VStack gap={4}>
      <Box
        width="48px"
        height="48px"
        borderRadius="xl"
        background={GRADIENTS.primaryDiagonalReverse}
        display="flex"
        alignItems="center"
        justifyContent="center"
        fontSize="2xl"
      >
        {icon}
      </Box>
      <Text
        fontSize="5xl"
        fontWeight="bold"
        background={GRADIENTS.primary}
        backgroundClip="text"
        color="transparent"
      >
        {value}
      </Text>
      <Text color="white" fontSize="lg" fontWeight="medium">
        {title}
      </Text>
      <Text color="gray.400" fontSize="sm">
        {description}
      </Text>
    </VStack>
  </Card>
);

export function Metrics() {
  const metrics = useQuery(api.metrics.getMetrics);

  if (!metrics) return null;

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="metrics">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="4xl" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="700" color="white">
              Trusted{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                at Scale
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Powering real-time blockchain monitoring for teams worldwide.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
            <MetricCard
              icon="🔗"
              value={metrics.totalChains}
              title="Chains Tracked"
              description="EVM, Solana, and more"
            />
            <MetricCard
              icon="📃"
              value={metrics.totalContractsListened}
              title="Contracts Listened"
              description="DeFi protocols monitored"
            />
            <MetricCard
              icon="👂"
              value={metrics.totalEventsListened}
              title="Events Tracked"
              description="On-chain events processed"
            />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
