"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useWallet } from "../providers/WalletContext";

export function Hero() {
  const { isConnected } = useWallet();

  return (
    <Box
      as="section"
      paddingY={20}
      background="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundImage="radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
        pointerEvents="none"
      />
      <Container maxW="4xl" position="relative" zIndex={1}>
        <VStack gap={8} textAlign="center">
          <Heading
            as="h1"
            size="3xl"
            color="white"
            fontWeight="bold"
            lineHeight="1.2"
          >
            Monitor Blockchain Events
            <br />
            <Box as="span" color="blue.400">
              Automatically
            </Box>
          </Heading>
          <Text fontSize="xl" color="gray.300" maxW="2xl" lineHeight="1.6">
            EventFlow helps you track smart contract events across multiple
            chains and get instant notifications. Set up event subscriptions in
            minutes and never miss important on-chain activity.
          </Text>
          <HStack gap={4}>
            {isConnected ? (
              <Link href="/dashboard">
                <Button size="lg" colorPalette="blue" paddingX={8}>
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Text color="gray.400" fontSize="lg">
                Connect your wallet to get started
              </Text>
            )}
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
