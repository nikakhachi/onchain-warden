"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { useWallet } from "../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./Button";

export function Hero() {
  const { isConnected } = useWallet();

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950">
      <Container maxW="7xl">
        <VStack gap={12} alignItems="center" textAlign="center">
          {/* Feature Tag */}
          <Box
            paddingX={4}
            paddingY={2}
            borderRadius="full"
            borderWidth="1px"
            borderColor="cyan.400"
            backgroundColor="rgba(6, 182, 212, 0.1)"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Text fontSize="lg">⚡</Text>
            <Text fontSize="sm" color="cyan.400" fontWeight="medium">
              Real-time DeFi Monitoring
            </Text>
          </Box>

          {/* Headline with Gradient */}
          <VStack gap={6}>
            <Heading
              as="h1"
              size="6xl"
              fontWeight="700"
              color="white"
              lineHeight="1.1"
            >
              Never Miss an{" "}
              <Box
                as="span"
                background="linear-gradient(90deg, #3b82f6, #9333ea)"
                backgroundClip="text"
                color="transparent"
              >
                On-Chain Event
              </Box>{" "}
              Again
            </Heading>

            {/* Description */}
            <Text fontSize="xl" color="gray.400" maxW="3xl" lineHeight="1.6">
              Track smart contracts, monitor whale movements, and get instant
              alerts for any blockchain event. Built for DeFi traders,
              developers, and protocols.
            </Text>

            {/* CTA Buttons */}
            <HStack gap={4} marginTop={4}>
              {isConnected ? (
                <Link href="/dashboard">
                  <Button variant="primary" size="lg">
                    Go to Dashboard →
                  </Button>
                </Link>
              ) : (
                <Box>
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => {
                      return (
                        <Button
                          variant="primary"
                          size="lg"
                          onClick={openConnectModal}
                        >
                          Get Started →
                        </Button>
                      );
                    }}
                  </ConnectButton.Custom>
                </Box>
              )}
              <Link href="#how-it-works">
                <Button variant="secondary" size="lg">
                  Learn More
                </Button>
              </Link>
            </HStack>
          </VStack>

          {/* Statistics */}
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={8}
            width="100%"
            marginTop={12}
          >
            <VStack>
              <Text
                fontSize="5xl"
                fontWeight="bold"
                background="linear-gradient(90deg, #3b82f6, #9333ea)"
                backgroundClip="text"
                color="transparent"
              >
                10+
              </Text>
              <Text color="gray.400" fontSize="md">
                Chains Supported
              </Text>
            </VStack>
            <VStack>
              <Text
                fontSize="5xl"
                fontWeight="bold"
                background="linear-gradient(90deg, #3b82f6, #9333ea)"
                backgroundClip="text"
                color="transparent"
              >
                100K+
              </Text>
              <Text color="gray.400" fontSize="md">
                Contracts Tracked
              </Text>
            </VStack>
            <VStack>
              <Text
                fontSize="5xl"
                fontWeight="bold"
                background="linear-gradient(90deg, #3b82f6, #9333ea)"
                backgroundClip="text"
                color="transparent"
              >
                &lt;1s
              </Text>
              <Text color="gray.400" fontSize="md">
                Alert Latency
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
