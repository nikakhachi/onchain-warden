"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import Link from "next/link";
import { useWallet } from "../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function Hero() {
  const { isConnected } = useWallet();

  return (
    <Box as="section" paddingY={20} backgroundColor="white">
      <Container maxW="7xl">
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={12} alignItems="center">
          {/* Left: Text Content */}
          <VStack gap={6} alignItems="flex-start" textAlign="left">
            {/* Primary Text */}
            <Heading
              as="h1"
              size="3xl"
              color="gray.900"
              fontWeight="700"
              lineHeight="1.2"
            >
              Real-Time ERC-20 Event Monitoring, Simplified
            </Heading>

            {/* Secondary Text */}
            <Text fontSize="xl" color="gray.700" fontWeight="500">
              Gain immediate on-chain visibility
            </Text>

            {/* Description */}
            <Text fontSize="lg" color="gray.600" lineHeight="1.6">
              Receive instant, configurable alerts for significant ERC-20 token
              transfers on Ethereum, Polygon, and Arbitrum—no complex
              infrastructure required.
            </Text>

            {/* Buttons */}
            <HStack gap={4}>
              {isConnected ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    backgroundColor="rgb(37, 99, 235)"
                    color="white"
                    paddingX={8}
                    borderRadius="xl"
                    fontWeight="500"
                    _hover={{ backgroundColor: "rgb(29, 78, 216)" }}
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Box>
                  <ConnectButton.Custom>
                    {({
                      account,
                      chain,
                      openAccountModal,
                      openChainModal,
                      openConnectModal,
                      authenticationStatus,
                      mounted,
                    }) => {
                      const ready =
                        mounted && authenticationStatus !== "loading";
                      const connected =
                        ready &&
                        account &&
                        chain &&
                        (!authenticationStatus ||
                          authenticationStatus === "authenticated");

                      return (
                        <Button
                          size="lg"
                          backgroundColor="rgb(37, 99, 235)"
                          color="white"
                          paddingX={8}
                          borderRadius="xl"
                          fontWeight="500"
                          onClick={openConnectModal}
                          _hover={{ backgroundColor: "rgb(29, 78, 216)" }}
                        >
                          Connect Wallet
                        </Button>
                      );
                    }}
                  </ConnectButton.Custom>
                </Box>
              )}
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="gray.300"
                  color="gray.700"
                  paddingX={8}
                  borderRadius="xl"
                  fontWeight="500"
                  backgroundColor="white"
                  _hover={{
                    backgroundColor: "gray.50",
                    borderColor: "gray.400",
                  }}
                >
                  See how it works
                </Button>
              </Link>
            </HStack>
          </VStack>

          {/* Right: Picture/Visual */}
          <Box
            borderRadius="2xl"
            overflow="hidden"
            backgroundColor="white"
            borderWidth="1px"
            borderColor="gray.200"
            boxShadow="0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
          >
            <Box
              width="100%"
              height="400px"
              backgroundColor="gray.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="gray.500" fontSize="sm">
                Dashboard Preview
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>
    </Box>
  );
}
