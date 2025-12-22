"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { GRADIENTS, ICON_COLORS } from "../theme";
import { useCases } from "../data/useCases";
import { READY_EVENTS } from "../data/readyEvents";
import { Card } from "./Card";
import { ProtocolIcon } from "../icons/ProtocolIcon";

export function UseCases() {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="templates">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={4} textAlign="center">
            <Heading
              as="h2"
              size="4xl"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="700"
              color="white"
            >
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
              Custom alerts for any use case. Pre-built templates to get started
              fast.
            </Text>

            <Box
              display="flex"
              gap={2}
              padding={1.5}
              borderRadius="lg"
              backgroundColor="rgba(33, 33, 33, 0.2)"
              borderWidth="1px"
              borderColor="gray.800"
              width="fit-content"
            >
              <Box
                as="button"
                paddingX={4}
                paddingY={2}
                borderRadius="md"
                backgroundImage={!showTemplates ? GRADIENTS.button : "none"}
                backgroundColor={!showTemplates ? "transparent" : "transparent"}
                color={!showTemplates ? "white" : "gray.400"}
                onClick={() => setShowTemplates(false)}
                fontWeight={!showTemplates ? "600" : "500"}
                fontSize="sm"
                transition="all 0.2s"
                _hover={{
                  backgroundImage: !showTemplates ? GRADIENTS.button : "none",
                  backgroundColor: !showTemplates ? "transparent" : "gray.700",
                  color: !showTemplates ? "white" : "gray.300",
                  opacity: !showTemplates ? 0.9 : 1,
                }}
              >
                Use Cases
              </Box>
              <Box
                as="button"
                paddingX={4}
                paddingY={2}
                borderRadius="md"
                backgroundImage={showTemplates ? GRADIENTS.button : "none"}
                backgroundColor={showTemplates ? "transparent" : "transparent"}
                color={showTemplates ? "white" : "gray.400"}
                onClick={() => setShowTemplates(true)}
                fontWeight={showTemplates ? "600" : "500"}
                fontSize="sm"
                transition="all 0.2s"
                _hover={{
                  backgroundImage: showTemplates ? GRADIENTS.button : "none",
                  backgroundColor: showTemplates ? "transparent" : "gray.700",
                  color: showTemplates ? "white" : "gray.300",
                  opacity: showTemplates ? 0.9 : 1,
                }}
              >
                Templates ({READY_EVENTS.length})
              </Box>
            </Box>
          </VStack>

          {!showTemplates ? (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              gap={6}
              width="100%"
            >
              {useCases.map((useCase, index) => {
                const isCustomUseCase = index === 5;
                return (
                  <Card
                    key={index}
                    {...(isCustomUseCase && {
                      borderWidth: "2px",
                      borderColor: "gray.700",
                    })}
                  >
                    <VStack gap={4} alignItems="flex-start">
                      {!isCustomUseCase && (
                        <Box
                          width="48px"
                          height="48px"
                          borderRadius="lg"
                          backgroundColor={
                            ICON_COLORS[
                              useCase.iconColor as keyof typeof ICON_COLORS
                            ]
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
                      )}

                      <Heading as="h3" size="md" fontWeight="600" color="white">
                        {useCase.title}
                      </Heading>

                      <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                        {useCase.description}
                      </Text>
                    </VStack>
                  </Card>
                );
              })}
            </SimpleGrid>
          ) : (
            <SimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              gap={6}
              width="100%"
            >
              {READY_EVENTS.map((template, index) => (
                <Card key={index}>
                  <VStack gap={4} alignItems="flex-start">
                    <Box
                      width="48px"
                      height="48px"
                      borderRadius="lg"
                      backgroundColor="gray.800"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Box width="32px" height="32px">
                        <ProtocolIcon name={template.protocol} />
                      </Box>
                    </Box>

                    <VStack alignItems="flex-start" gap={1} width="100%">
                      <Heading as="h3" size="md" fontWeight="600" color="white">
                        {template.description}
                      </Heading>
                      <HStack gap={2} alignItems="center">
                        <Text color="gray.500" fontSize="xs">
                          {template.protocol}
                        </Text>
                        <Text color="gray.600" fontSize="xs">
                          •
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize="xs"
                          fontFamily="mono"
                          wordBreak="break-all"
                        >
                          {template.contract_address.slice(0, 6)}...
                          {template.contract_address.slice(-4)}
                        </Text>
                      </HStack>
                    </VStack>

                    <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                      {template.event_abi}
                    </Text>
                  </VStack>
                </Card>
              ))}
              <Card
                borderWidth="2px"
                borderColor="gray.700"
              >
                <VStack gap={4} alignItems="flex-start">
                  <Heading as="h3" size="md" fontWeight="600" color="white">
                    Don't see your use case?
                  </Heading>
                  <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                    Create a custom alert for any blockchain event.
                  </Text>
                </VStack>
              </Card>
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
