"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { GRADIENTS } from "../theme";

const steps = [
  {
    number: "01",
    title: "Connect",
    description:
      "Set up your wallet or enter any contract addresses you want to monitor across multiple chains.",
    icon: "👛", // Wallet icon placeholder
  },
  {
    number: "02",
    title: "Configure",
    description:
      "Choose from pre-built DeFi templates or create custom triggers for any on-chain event.",
    icon: "⚙️", // Gear icon placeholder
  },
  {
    number: "03",
    title: "Get Notified",
    description:
      "Receive instant alerts via Telegram, Discord, email, or webhooks whenever your events fire.",
    icon: "🔔", // Bell icon placeholder
  },
];

export function HowItWorks() {
  return (
    <Box
      as="section"
      paddingY={20}
      backgroundColor="gray.950"
      id="how-it-works"
    >
      <Container maxW="7xl">
        <VStack gap={16}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="5xl" fontWeight="700" color="white">
              How It{" "}
              <Box
                as="span"
                background={GRADIENTS.primaryReverse}
                backgroundClip="text"
                color="transparent"
              >
                Works
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Get started in minutes with our simple 3-step setup.
            </Text>
          </VStack>

          {/* Steps Grid */}
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={8}
            width="100%"
            position="relative"
          >
            {steps.map((step, index) => (
              <Box key={index} position="relative">
                {/* Large Semi-transparent Number */}
                <Text
                  position="absolute"
                  top="-40px"
                  left="0"
                  fontSize="120px"
                  fontWeight="bold"
                  color="rgba(255, 255, 255, 0.05)"
                  lineHeight="1"
                  zIndex={0}
                >
                  {step.number}
                </Text>

                {/* Card */}
                <Box
                  position="relative"
                  zIndex={1}
                  padding={6}
                  borderRadius="2xl"
                  backgroundColor="gray.900"
                  borderWidth="1px"
                  borderColor="gray.800"
                  transition="all 0.3s"
                  _hover={{
                    borderColor: "gray.700",
                    transform: "translateY(-4px)",
                  }}
                >
                  <VStack gap={4} alignItems="flex-start" textAlign="left">
                    {/* Icon Box with Gradient */}
                    <Box
                      width="64px"
                      height="64px"
                      borderRadius="xl"
                      background={GRADIENTS.primaryDiagonalReverse}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontSize="2xl"
                    >
                      {step.icon}
                    </Box>

                    {/* Title */}
                    <Heading as="h3" size="lg" fontWeight="600" color="white">
                      {step.title}
                    </Heading>

                    {/* Description */}
                    <Text color="gray.400" fontSize="md" lineHeight="1.7">
                      {step.description}
                    </Text>
                  </VStack>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
