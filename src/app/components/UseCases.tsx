"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { GRADIENTS, ICON_COLORS } from "../theme";
import { useCases } from "../data/useCases";
import { Card } from "./Card";

export function UseCases() {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="templates">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading as="h2" size="4xl" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="700" color="white">
              Built for{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
              >
                Everyone
              </Box>
            </Heading>
            <Text color="gray.400" fontSize="lg" maxW="2xl">
              Pre-built templates for common DeFi monitoring use cases.
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
            {useCases.map((useCase, index) => (
              <Card key={index}>
                <VStack gap={4} alignItems="flex-start">
                  <Box
                    width="48px"
                    height="48px"
                    borderRadius="lg"
                    backgroundColor={
                      ICON_COLORS[useCase.iconColor as keyof typeof ICON_COLORS]
                    }
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="2xl"
                    color="white"
                    fontWeight="bold"
                  >
                    {useCase.icon}
                  </Box>

                  <Heading as="h3" size="md" fontWeight="600" color="white">
                    {useCase.title}
                  </Heading>

                  <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                    {useCase.description}
                  </Text>
                </VStack>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
}
