"use client";

import { Box, Heading, Text, VStack, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { ICON_COLORS } from "../../theme";
import { useCases } from "../../data/useCases";
import { Card } from "../Card";
import { Button } from "../Button";

export function UseCasesContent() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
      {useCases.map((useCase, index) => {
        const isCustomUseCase = index === 5;
        return (
          <Card
            key={index}
            {...(isCustomUseCase && {
              borderWidth: "2px",
              borderColor: "gray.700",
            })}
            display="flex"
            flexDirection="column"
            height="100%"
          >
            <VStack gap={4} alignItems="flex-start" flex={1} height="100%" width="100%">
              {!isCustomUseCase && (
                <Box
                  width="48px"
                  height="48px"
                  borderRadius="lg"
                  backgroundColor={ICON_COLORS[useCase.iconColor as keyof typeof ICON_COLORS]}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  color="white"
                  fontWeight="bold"
                >
                  {useCase.icon}
                </Box>
              )}

              <Heading as="h3" size="md" fontWeight="600" color="white">
                {useCase.title}
              </Heading>

              <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                {useCase.description}
              </Text>

              {isCustomUseCase && (
                <Box marginTop="auto" width="fit-content">
                  <Link href="/dashboard">
                    <Button variant="primary" size="sm">
                      Create Custom Alert
                    </Button>
                  </Link>
                </Box>
              )}
            </VStack>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}
