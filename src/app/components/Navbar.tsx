"use client";

import { useWallet } from "../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Box, HStack, Heading, Container, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./Button";

export function Navbar() {
  const { isConnected } = useWallet();
  const pathname = usePathname();

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottomWidth="1px"
      borderBottomColor="gray.800"
      backdropFilter="blur(10px)"
      backgroundColor="rgba(17, 24, 39, 0.9)"
    >
      <Container maxW="7xl" paddingY={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Heading
              as="h1"
              size="lg"
              color="white"
              _hover={{
                background: "linear-gradient(90deg, #3b82f6, #9333ea)",
                backgroundClip: "text",
                color: "transparent",
              }}
              transition="all 0.2s"
              fontWeight="600"
            >
              onchain warden
            </Heading>
          </Link>

          <HStack gap={6} alignItems="center">
            <Link href="/" style={{ textDecoration: "none" }}>
              <Box
                as="span"
                color={pathname === "/" ? "white" : "gray.400"}
                _hover={{ color: "white" }}
                fontSize="sm"
                fontWeight={pathname === "/" ? "600" : "normal"}
                cursor="pointer"
                transition="color 0.2s"
              >
                Home
              </Box>
            </Link>
            <Link href="#how-it-works" style={{ textDecoration: "none" }}>
              <Box
                as="span"
                color="gray.400"
                _hover={{ color: "white" }}
                fontSize="sm"
                cursor="pointer"
                transition="color 0.2s"
              >
                How it Works
              </Box>
            </Link>
            <Link href="#templates" style={{ textDecoration: "none" }}>
              <Box
                as="span"
                color="gray.400"
                _hover={{ color: "white" }}
                fontSize="sm"
                cursor="pointer"
                transition="color 0.2s"
              >
                Templates
              </Box>
            </Link>
            {isConnected && (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            )}
            {!isConnected && (
              <Button variant="primary" size="sm">
                Get Started
              </Button>
            )}
            <ConnectButton
              showBalance={false}
              accountStatus="address"
              chainStatus={{ largeScreen: "none", smallScreen: "none" }}
            />
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
