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
      borderBottomColor="gray.200"
      backdropFilter="blur(10px)"
      backgroundColor="rgba(255, 255, 255, 0.9)"
    >
      <Container maxW="7xl" paddingY={4}>
        <HStack justifyContent="space-between" alignItems="center">
          <Link href="/" style={{ textDecoration: "none" }}>
            <Heading
              as="h1"
              size="lg"
              color="gray.900"
              _hover={{ color: "rgb(37, 99, 235)" }}
              transition="color 0.2s"
              fontWeight="600"
            >
              EventFlow
            </Heading>
          </Link>

          <HStack gap={6} alignItems="center">
            <Link href="/">
              <Button
                variant={pathname === "/" ? "solid" : "ghost"}
                colorPalette={pathname === "/" ? "blue" : "gray"}
                color={pathname === "/" ? "white" : "gray.700"}
                borderRadius="xl"
                _hover={{
                  backgroundColor:
                    pathname === "/" ? "rgb(29, 78, 216)" : "gray.100",
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
                  color={pathname === "/dashboard" ? "white" : "gray.700"}
                  borderRadius="xl"
                  _hover={{
                    backgroundColor:
                      pathname === "/dashboard"
                        ? "rgb(29, 78, 216)"
                        : "gray.100",
                  }}
                >
                  Dashboard
                </Button>
              </Link>
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
