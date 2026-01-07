"use client";

import { Box, Container, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";
import { GRADIENTS } from "../../theme";
import { howSteps } from "../../shared/data/howSteps";
import { Card } from "../Card";

export function HowItWorks() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="how-it-works">
      <Container maxW="7xl">
        <VStack gap={16}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="4xl" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="700" color="white">
              How It{" "}
              <Box as="span" background={GRADIENTS.primaryReverse} backgroundClip="text" color="transparent">
                Works
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Get started with our simple 3-step setup.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%" position="relative">
            {howSteps.map((step, index) => (
              <Box key={index} position="relative">
                <Text
                  position="absolute"
                  top="-40px"
                  right="0"
                  fontSize="120px"
                  fontWeight="bold"
                  color="rgba(255, 255, 255, 0.05)"
                  lineHeight="1"
                  zIndex={0}
                >
                  {step.number}
                </Text>

                <Card position="relative" zIndex={1}>
                  <VStack gap={4} alignItems="flex-start" textAlign="left">
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

                    <Heading as="h3" size="md" fontWeight="600" color="white" opacity={1}>
                      {step.title}
                    </Heading>

                    <Text color="gray.400" fontSize="md" lineHeight="1.7" opacity={1}>
                      {step.description}
                    </Text>
                  </VStack>
                </Card>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
