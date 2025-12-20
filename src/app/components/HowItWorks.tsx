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

const steps = [
  {
    number: "1",
    title: "Connect wallet",
    description: "No private keys. Read-only access.",
  },
  {
    number: "2",
    title: "Choose a template or custom event",
    description: "Start with pre-built templates or define your own.",
  },
  {
    number: "3",
    title: "Add conditions",
    description: "Filter events by values (e.g., amount > 1,000,000).",
  },
  {
    number: "4",
    title: "Customize notification",
    description: "Toggle fields, format decimals, add custom labels.",
  },
  {
    number: "5",
    title: "Receive real-time alerts",
    description: "Get instant notifications to Telegram, Slack, or Discord.",
  },
];

export function HowItWorks() {
  return (
    <Box as="section" paddingY={20} backgroundColor="white" id="how-it-works">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="2xl" color="gray.900" fontWeight="600">
              How it works
            </Heading>
            <Text color="gray.600" fontSize="lg" maxW="2xl">
              Set up your first event watcher in 2 minutes
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 5 }} gap={6} width="100%">
            {steps.map((step, index) => (
              <VStack key={index} gap={3} alignItems="flex-start">
                <Box
                  width="100%"
                  height="120px"
                  borderRadius="xl"
                  backgroundColor="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                >
                  <Text color="gray.500" fontSize="xs">
                    {step.title}
                  </Text>
                </Box>
                <HStack gap={3}>
                  <Box
                    width={8}
                    height={8}
                    borderRadius="xl"
                    backgroundColor="rgb(37, 99, 235)"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Text color="white" fontWeight="bold" fontSize="sm">
                      {step.number}
                    </Text>
                  </Box>
                  <Heading as="h3" size="sm" color="gray.900" fontWeight="600">
                    {step.title}
                  </Heading>
                </HStack>
                <Text color="gray.600" fontSize="sm" lineHeight="1.6">
                  {step.description}
                </Text>
              </VStack>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
