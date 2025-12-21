"use client";

import { useWallet } from "../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Box, HStack, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "./Button";
import { GRADIENTS } from "../theme";

export function Navbar() {
  const { isConnected } = useWallet();

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      zIndex={1000}
      borderBottomWidth="1px"
      borderBottomColor="gray.800"
      backdropFilter="blur(10px)"
      backgroundColor="gray.950"
    >
      <HStack
        paddingY={4}
        paddingX={4}
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Logo with gradient icon */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <HStack gap={3} alignItems="center">
            <Box
              width="40px"
              height="40px"
              borderRadius="lg"
              background={GRADIENTS.primaryDiagonal}
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xl"
              color="white"
            >
              ⚡
            </Box>
            <Heading as="h1" size="lg" color="white" fontWeight="600">
              onchain.warden
            </Heading>
          </HStack>
        </Link>

        {/* Center Navigation Links */}
        <HStack gap={8} alignItems="center" flex={1} justifyContent="center">
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
          <Link href="#pricing" style={{ textDecoration: "none" }}>
            <Box
              as="span"
              color="gray.400"
              _hover={{ color: "white" }}
              fontSize="sm"
              cursor="pointer"
              transition="color 0.2s"
            >
              Pricing
            </Box>
          </Link>
          <Link href="#docs" style={{ textDecoration: "none" }}>
            <Box
              as="span"
              color="gray.400"
              _hover={{ color: "white" }}
              fontSize="sm"
              cursor="pointer"
              transition="color 0.2s"
            >
              Docs
            </Box>
          </Link>
        </HStack>

        {/* Right Action Buttons */}
        <HStack gap={4} alignItems="center">
          {isConnected && (
            <Link href="/dashboard" style={{ textDecoration: "none" }}>
              <Button variant="primary" size="sm">
                Dashboard
              </Button>
            </Link>
          )}
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
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === "authenticated");

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={openConnectModal}
                        >
                          Connect Wallet
                        </Button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={openChainModal}
                        >
                          Wrong network
                        </Button>
                      );
                    }

                    return (
                      <HStack gap={2}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={openChainModal}
                        >
                          {chain.hasIcon && (
                            <Box
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </Box>
                          )}
                          {chain.name}
                        </Button>

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={openAccountModal}
                        >
                          {account.displayName}
                        </Button>
                      </HStack>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </HStack>
      </HStack>
    </Box>
  );
}
