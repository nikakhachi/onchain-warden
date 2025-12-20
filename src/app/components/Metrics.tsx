"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
} from "@chakra-ui/react";

// Chain icons - using simple colored circles as placeholders
const chainIcons = [
  { name: "Ethereum", color: "blue.500" },
  { name: "Base", color: "blue.400" },
  { name: "Arbitrum", color: "purple.500" },
  { name: "Polygon", color: "purple.400" },
];

// Protocol icons - using simple colored circles as placeholders
const protocolIcons = [
  { name: "Morpho", color: "blue.500" },
  { name: "Euler", color: "green.500" },
  { name: "Aave", color: "purple.500" },
  { name: "Uniswap", color: "pink.500" },
  { name: "Pendle", color: "orange.500" },
];

function ChainIcon({ name, color }: { name: string; color: string }) {
  return (
    <Box
      width={10}
      height={10}
      borderRadius="full"
      backgroundColor={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      title={name}
    >
      <Text fontSize="xs" color="white" fontWeight="bold">
        {name[0]}
      </Text>
    </Box>
  );
}

function ProtocolIcon({ name, color }: { name: string; color: string }) {
  return (
    <Box
      width={10}
      height={10}
      borderRadius="full"
      backgroundColor={color}
      display="flex"
      alignItems="center"
      justifyContent="center"
      title={name}
    >
      <Text fontSize="xs" color="white" fontWeight="bold">
        {name[0]}
      </Text>
    </Box>
  );
}

interface MetricCardProps {
  number: string;
  label: string;
  icons?: React.ReactNode;
}

function MetricCard({ number, label, icons }: MetricCardProps) {
  return (
    <Box
      padding={8}
      borderRadius="2xl"
      backgroundColor="white"
      borderWidth="1px"
      borderColor="gray.200"
      textAlign="center"
      boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
    >
      <VStack gap={4}>
        <Text fontSize="5xl" fontWeight="bold" color="gray.900">
          {number}
        </Text>
        <Text>{label}</Text>
        {icons && (
          <HStack gap={2} justifyContent="center" marginTop={2}>
            {icons}
          </HStack>
        )}
      </VStack>
    </Box>
  );
}

export function Metrics() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="5xl" fontWeight="700" color="white">
              Trusted{" "}
              <Box
                as="span"
                background="linear-gradient(90deg, #3b82f6, #9333ea)"
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
            <Box
              padding={8}
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
              textAlign="center"
            >
              <VStack gap={4}>
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor="#14b8a6"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                >
                  🔗
                </Box>
                <Text
                  fontSize="5xl"
                  fontWeight="bold"
                  background="linear-gradient(90deg, #3b82f6, #9333ea)"
                  backgroundClip="text"
                  color="transparent"
                >
                  10+
                </Text>
                <Text color="white" fontSize="lg" fontWeight="medium">
                  Chains Tracked
                </Text>
                <Text color="gray.400" fontSize="sm">
                  EVM, Solana, and more
                </Text>
              </VStack>
            </Box>

            <Box
              padding={8}
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
              textAlign="center"
            >
              <VStack gap={4}>
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor="#14b8a6"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                >
                  {"{}"}
                </Box>
                <Text
                  fontSize="5xl"
                  fontWeight="bold"
                  background="linear-gradient(90deg, #3b82f6, #9333ea)"
                  backgroundClip="text"
                  color="transparent"
                >
                  100K+
                </Text>
                <Text color="white" fontSize="lg" fontWeight="medium">
                  Contracts Tracked
                </Text>
                <Text color="gray.400" fontSize="sm">
                  DeFi protocols monitored
                </Text>
              </VStack>
            </Box>

            <Box
              padding={8}
              borderRadius="2xl"
              backgroundColor="gray.900"
              borderWidth="1px"
              borderColor="gray.800"
              textAlign="center"
            >
              <VStack gap={4}>
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor="#14b8a6"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                >
                  📊
                </Box>
                <Text
                  fontSize="5xl"
                  fontWeight="bold"
                  background="linear-gradient(90deg, #3b82f6, #9333ea)"
                  backgroundClip="text"
                  color="transparent"
                >
                  1M+
                </Text>
                <Text color="white" fontSize="lg" fontWeight="medium">
                  Events Tracked
                </Text>
                <Text color="gray.400" fontSize="sm">
                  On-chain events processed
                </Text>
              </VStack>
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
