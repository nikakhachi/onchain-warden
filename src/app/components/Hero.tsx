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
import { GRADIENTS, ACCENT_COLORS } from "../theme";

export function Hero() {
  const { isConnected } = useWallet();

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950">
      <Container maxW="7xl">
        <VStack gap={12} alignItems="center" textAlign="center">
          <Box
            paddingX={4}
            paddingY={2}
            borderRadius="full"
            borderWidth="1px"
            borderColor={ACCENT_COLORS.cyan[400]}
            backgroundColor={ACCENT_COLORS.cyan.bg}
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Text fontSize="lg">⚡</Text>
            <Text
              fontSize="sm"
              color={ACCENT_COLORS.cyan[300]}
              fontWeight="medium"
            >
              Real-time DeFi Monitoring
            </Text>
          </Box>

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
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                On-Chain Event
              </Box>{" "}
              Again
            </Heading>

            <Text fontSize="xl" color="gray.400" maxW="3xl" lineHeight="1.6">
              Track smart contracts, market movements, and get instant alerts
              for any blockchain event. Built for DeFi protocols, analysts, and
              traders.
            </Text>

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
              <Button
                variant="secondary"
                size="lg"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.querySelector("#how-it-works");
                  if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - offset;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                Learn More
              </Button>
            </HStack>
          </VStack>

          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            width="100%"
            marginTop={8}
            maxW="2xl"
          >
            <VStack gap={1}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                10+
              </Text>
              <Text color="gray.400" fontSize="sm">
                Chains Supported
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                50+
              </Text>
              <Text color="gray.400" fontSize="sm">
                Protocols Tracked
              </Text>
            </VStack>
            <VStack gap={1}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                &lt;1s
              </Text>
              <Text color="gray.400" fontSize="sm">
                Alert Latency
              </Text>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
