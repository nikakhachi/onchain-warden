"use client";

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Icon,
} from "@chakra-ui/react";

const features = [
  {
    title: "Multi-Chain Support",
    description:
      "Monitor events across Ethereum, Base, and more. One platform for all your blockchain monitoring needs.",
    icon: "⛓️",
  },
  {
    title: "Real-Time Notifications",
    description:
      "Get instant alerts when events occur. Configure notifications via Telegram, Slack, or custom webhooks.",
    icon: "🔔",
  },
  {
    title: "Easy Setup",
    description:
      "Create event subscriptions in minutes. Just provide the contract address and event ABI, and we handle the rest.",
    icon: "⚡",
  },
  {
    title: "Secure & Decentralized",
    description:
      "Your wallet signature verifies ownership. No central authority controls your subscriptions.",
    icon: "🔒",
  },
  {
    title: "Flexible Task Definitions",
    description:
      "Customize how events are processed. Define your own notification logic and data transformations.",
    icon: "🎯",
  },
  {
    title: "Production Ready",
    description:
      "Built for reliability. Monitor thousands of contracts with confidence.",
    icon: "🚀",
  },
];

export function Features() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.900">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="2xl" color="white">
              Powerful Features
            </Heading>
            <Text color="gray.400" fontSize="lg" maxW="2xl">
              Everything you need to monitor blockchain events effectively
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8} width="100%">
            {features.map((feature, index) => (
              <Box
                key={index}
                padding={6}
                borderRadius="lg"
                backgroundColor="gray.800"
                borderWidth="1px"
                borderColor="gray.700"
                transition="all 0.3s"
                _hover={{
                  borderColor: "blue.500",
                  transform: "translateY(-4px)",
                  boxShadow: "0 10px 25px rgba(59, 130, 246, 0.2)",
                }}
              >
                <VStack gap={4} alignItems="flex-start">
                  <Text fontSize="4xl">{feature.icon}</Text>
                  <Heading as="h3" size="md" color="white">
                    {feature.title}
                  </Heading>
                  <Text color="gray.400" lineHeight="1.6">
                    {feature.description}
                  </Text>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
