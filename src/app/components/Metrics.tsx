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
        <Text fontSize="sm" color="gray.600" fontWeight="medium">
          {label}
        </Text>
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
    <Box as="section" paddingY={20} backgroundColor="white">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="2xl" color="gray.900" fontWeight="600">
              Platform Metrics
            </Heading>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
            <MetricCard
              number="4"
              label="Chains we are live on"
              icons={
                <>
                  {chainIcons.map((chain) => (
                    <ChainIcon
                      key={chain.name}
                      name={chain.name}
                      color={chain.color}
                    />
                  ))}
                </>
              }
            />
            <MetricCard
              number="5+"
              label="Contracts we track"
              icons={
                <>
                  {protocolIcons.map((protocol) => (
                    <ProtocolIcon
                      key={protocol.name}
                      name={protocol.name}
                      color={protocol.color}
                    />
                  ))}
                </>
              }
            />
            <MetricCard number="100+" label="Events we track" />
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
