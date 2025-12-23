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
import { useWallet } from "../../providers/WalletContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../Button";
import { GRADIENTS, ACCENT_COLORS, GRADIENT_COLORS } from "../../theme";
import { IntegrationIcon } from "../../icons/IntegrationIcon";
import { ProtocolIcon } from "../../icons/ProtocolIcon";
import { ChainIcon } from "../../icons/ChainIcon";

const animatedBackgroundStyles = `
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .hero-animated-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      ${GRADIENT_COLORS.blue}10,
      ${GRADIENT_COLORS.purple}10,
      ${GRADIENT_COLORS.blue}10
    );
    background-size: 300% 300%;
    animation: gradientShift 20s ease-in-out infinite;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
    filter: blur(60px);
  }
`;

const IconBox = ({ icon }: { icon: React.ReactNode }) => {
  return (
    <Box
      width="20px"
      height="20px"
      borderRadius="full"
      overflow="hidden"
      flexShrink={0}
    >
      {icon}
    </Box>
  );
};

export function Hero() {
  const { isConnected } = useWallet();

  return (
    <Box
      as="section"
      paddingY={20}
      backgroundColor="gray.950"
      position="relative"
      overflow="hidden"
    >
      <style>{animatedBackgroundStyles}</style>
      <Box className="hero-animated-bg" />
      <Container maxW="7xl" position="relative" zIndex={1}>
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
              size="4xl"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl", xl: "6xl" }}
              fontWeight="700"
              color="white"
              lineHeight="1.1"
            >
              Your Custom{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                On-Chain Alert
              </Box>{" "}
              System
            </Heading>

            <Text fontSize="xl" color="gray.400" maxW="3xl" lineHeight="1.6">
              Monitor any event from any contract on any chain. Define
              conditions, customize notifications, and get instant alerts.{" "}
              <Text as="span" textDecoration="underline">
                Free to use
              </Text>
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
                          Create Your First Alert →
                        </Button>
                      );
                    }}
                  </ConnectButton.Custom>
                </Box>
              )}
              <Button
                variant="secondary"
                size="lg"
                onClick={(e: React.MouseEvent) => {
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
                20+
              </Text>
              <Text color="gray.400" fontSize="sm">
                Protocols Tracked, including
              </Text>
              <HStack gap={1} justifyContent="center" flexWrap="wrap">
                {[
                  "Morpho",
                  "Pendle",
                  "Euler",
                  "Reservoir",
                  "Aave",
                  "Uniswap",
                ].map((item, index) => (
                  <IconBox key={index} icon={<ProtocolIcon name={item} />} />
                ))}
              </HStack>
            </VStack>
            <VStack gap={1}>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                4
              </Text>
              <Text color="gray.400" fontSize="sm">
                Notification Channels
              </Text>
              <HStack mt={1} gap={1} justifyContent="center" flexWrap="wrap">
                {["Telegram", "Slack", "Webhook", "Discord"].map(
                  (item, index) => (
                    <IconBox
                      key={index}
                      icon={<IntegrationIcon name={item} />}
                    />
                  )
                )}
              </HStack>
            </VStack>
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
                Chains Supported, including
              </Text>
              <HStack gap={1} justifyContent="center" flexWrap="wrap">
                {[
                  "Ethereum",
                  "Base",
                  "Binance",
                  "Katana",
                  "Avalanche",
                  "Polygon",
                ].map((item, index) => (
                  <IconBox key={index} icon={<ChainIcon name={item} />} />
                ))}
              </HStack>
            </VStack>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
