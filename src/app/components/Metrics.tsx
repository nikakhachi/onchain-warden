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

export function Metrics() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="metrics">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="5xl" fontWeight="700" color="white">
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
            <Card padding={8} textAlign="center" hoverable={false}>
              <VStack gap={4}>
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor={ICON_COLORS.teal}
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
                  background={GRADIENTS.primary}
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
            </Card>

            <Card padding={8} textAlign="center" hoverable={false}>
              <VStack gap={4}>
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor={ICON_COLORS.teal}
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
                  background={GRADIENTS.primary}
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
            </Card>

            <Card padding={8} textAlign="center" hoverable={false}>
              <VStack gap={4}>
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor={ICON_COLORS.teal}
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
                  background={GRADIENTS.primary}
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
            </Card>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
