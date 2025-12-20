"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { GRADIENTS, ICON_COLORS } from "../theme";

const useCases = [
  {
    title: "Whale Movements",
    description: "Track large token transfers and wallet activity from major holders.",
    iconColor: "teal",
    icon: "📈",
  },
  {
    title: "Liquidity Changes",
    description: "Monitor pool deposits, withdrawals, and TVL fluctuations.",
    iconColor: "blue",
    icon: "💧",
  },
  {
    title: "Lending Rate Alerts",
    description: "Get notified when borrow/supply rates hit your thresholds.",
    iconColor: "green",
    icon: "%",
  },
  {
    title: "Liquidation Warnings",
    description: "Stay ahead of at-risk positions across lending protocols.",
    iconColor: "yellow",
    icon: "⚠️",
  },
  {
    title: "DEX Swaps",
    description: "Track specific token swaps, arbitrage, and trading patterns.",
    iconColor: "purple",
    icon: "↔️",
  },
  {
    title: "Governance Events",
    description: "Never miss a vote, proposal, or protocol upgrade.",
    iconColor: "orange",
    icon: "🔒",
  },
];


export function UseCases() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="5xl" fontWeight="700" color="white">
              Built for{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                Everyone
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg" maxW="2xl">
              Pre-built templates for common DeFi monitoring use cases.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
            {useCases.map((useCase, index) => (
              <Box
                key={index}
                padding={6}
                borderRadius="2xl"
                backgroundColor="gray.900"
                borderWidth="1px"
                borderColor="gray.800"
                transition="all 0.3s"
                _hover={{
                  borderColor: "gray.700",
                  transform: "translateY(-4px)",
                }}
              >
                <VStack gap={4} alignItems="flex-start">
                  {/* Icon */}
                  <Box
                    width="48px"
                    height="48px"
                    borderRadius="lg"
                    backgroundColor={ICON_COLORS[useCase.iconColor as keyof typeof ICON_COLORS]}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                    color="white"
                    fontWeight="bold"
                  >
                    {useCase.icon}
                  </Box>

                  {/* Title */}
                  <Heading as="h3" size="md" fontWeight="600" color="white">
                    {useCase.title}
                  </Heading>

                  {/* Description */}
                  <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                    {useCase.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
