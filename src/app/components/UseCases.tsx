"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  HStack,
  Badge,
} from "@chakra-ui/react";

const useCases = [
  {
    title: "Cap Increase/Decrease",
    description: "Monitor market cap changes for tokens and protocols",
    configuration: ["Token address", "Cap threshold", "Change percentage"],
    example: "Morpho Market Cap Changes",
  },
  {
    title: "Collateral Addition",
    description: "Track when collateral is added to lending protocols",
    configuration: ["Protocol address", "Collateral type", "Amount threshold"],
    example: "Aave Collateral Deposits",
  },
  {
    title: "Liquidity Movement",
    description: "Monitor liquidity additions and removals from pools",
    configuration: ["Pool address", "Token pairs", "Liquidity threshold"],
    example: "Uniswap V3 Liquidity Changes",
  },
  {
    title: "Rates",
    description: "Track interest rate changes in lending protocols",
    configuration: ["Protocol address", "Rate type", "Change threshold"],
    example: "Compound Interest Rate Updates",
  },
  {
    title: "Pendle Rates",
    description: "Monitor Pendle protocol rate changes",
    configuration: ["Pendle contract", "Rate type", "Change threshold"],
    example: "Pendle Yield Rate Changes",
  },
  {
    title: "Large Transfers",
    description: "Alert on significant token transfers",
    configuration: ["Token address", "Amount threshold", "Wallet filter"],
    example: "USDC Transfers > $100K",
  },
];

export function UseCases() {
  return (
    <Box as="section" paddingY={20} backgroundColor="white">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Box
              paddingX={3}
              paddingY={1}
              borderRadius="full"
              backgroundColor="gray.100"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Text fontSize="xs" color="gray.600" fontWeight="medium">
                Use cases
              </Text>
            </Box>
            <Heading as="h2" size="2xl" color="gray.900" fontWeight="600">
              Built for Everyone
            </Heading>
            <Text color="gray.600" fontSize="lg" maxW="2xl">
              From individual traders to enterprise teams, monitor blockchain
              events that matter to you.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
            {useCases.map((useCase, index) => (
              <Box
                key={index}
                padding={6}
                borderRadius="2xl"
                backgroundColor="white"
                borderWidth="1px"
                borderColor="gray.200"
                transition="all 0.2s"
                boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                _hover={{
                  borderColor: "rgb(37, 99, 235)",
                  boxShadow:
                    "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                }}
              >
                <VStack gap={4} alignItems="flex-start">
                  <VStack gap={2} alignItems="flex-start" width="100%">
                    <Heading
                      as="h3"
                      size="md"
                      color="gray.900"
                      fontWeight="600"
                    >
                      {useCase.title}
                    </Heading>
                    <Text color="gray.600" fontSize="sm" lineHeight="1.6">
                      {useCase.description}
                    </Text>
                  </VStack>

                  <VStack gap={2} alignItems="flex-start" width="100%">
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Configuration
                    </Text>
                    <HStack gap={2} flexWrap="wrap">
                      {useCase.configuration.map((config, idx) => (
                        <Badge
                          key={idx}
                          paddingX={2}
                          paddingY={1}
                          borderRadius="lg"
                          backgroundColor="gray.100"
                          color="gray.700"
                          fontSize="xs"
                          borderWidth="1px"
                          borderColor="gray.200"
                        >
                          {config}
                        </Badge>
                      ))}
                    </HStack>
                  </VStack>

                  <VStack gap={2} alignItems="flex-start" width="100%">
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      fontWeight="semibold"
                      textTransform="uppercase"
                    >
                      Example
                    </Text>
                    <Text
                      fontSize="sm"
                      color="gray.700"
                      fontFamily="mono"
                      padding={2}
                      borderRadius="lg"
                      backgroundColor="gray.50"
                      borderWidth="1px"
                      borderColor="gray.200"
                      width="100%"
                    >
                      {useCase.example}
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
