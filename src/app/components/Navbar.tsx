"use client";

import { useWallet } from "../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Box, HStack, Heading, Button, Container } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
      backgroundColor="rgba(17, 24, 39, 0.8)"
    >
      <Container maxW="7xl" paddingY={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Heading
              as="h1"
              size="lg"
              color="white"
              _hover={{ color: "blue.400" }}
              transition="color 0.2s"
            >
              EventFlow
            </Heading>
          </Link>

          <HStack gap={6} alignItems="center">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "solid" : "ghost"}
                colorPalette={pathname === "/" ? "blue" : "gray"}
                color={pathname === "/" ? "white" : "gray.300"}
                _hover={{
                  backgroundColor: pathname === "/" ? "blue.600" : "gray.800",
                }}
              >
                Home
              </Button>
            </Link>
            {isConnected && (
              <Link href="/dashboard">
                <Button
                  variant={pathname === "/dashboard" ? "solid" : "ghost"}
                  colorPalette={pathname === "/dashboard" ? "blue" : "gray"}
                  color={pathname === "/dashboard" ? "white" : "gray.300"}
                  _hover={{
                    backgroundColor:
                      pathname === "/dashboard" ? "blue.600" : "gray.800",
                  }}
                >
                  Dashboard
                </Button>
              </Link>
            )}
            <ConnectButton />
          </HStack>
        </HStack>
      </Container>
    </Box>
  );
}
