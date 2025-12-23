"use client";

import { useMemo } from "react";
import {
  Box,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { READY_EVENTS } from "../../data/readyEvents";
import { Card } from "../Card";
import { ProtocolIcon } from "../../icons/ProtocolIcon";

export function TemplatesContent() {
  // Group templates by protocol
  const templatesByProtocol = useMemo(() => {
    const grouped: Record<string, typeof READY_EVENTS> = {};
    READY_EVENTS.forEach((template) => {
      if (!grouped[template.protocol]) {
        grouped[template.protocol] = [];
      }
      grouped[template.protocol].push(template);
    });
    return grouped;
  }, []);

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%">
      {Object.entries(templatesByProtocol).map(([protocol, templates]) => (
        <Card key={protocol}>
          <VStack gap={4} alignItems="flex-start">
            <HStack gap={3} alignItems="center" width="100%">
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
                  <ProtocolIcon name={protocol} />
                </Box>
              </Box>
              <VStack alignItems="flex-start" gap={0.5} flex={1}>
                <Heading as="h3" size="md" fontWeight="600" color="white">
                  {protocol}
                </Heading>
                <Text color="gray.400" fontSize="xs">
                  {templates.length} template{templates.length !== 1 ? "s" : ""}
                </Text>
              </VStack>
            </HStack>

            <VStack alignItems="flex-start" gap={2.5} width="100%">
              {templates.map((template, index) => (
                <Box key={index} width="100%">
                  <HStack gap={2} alignItems="center">
                    <Box
                      width="4px"
                      height="4px"
                      borderRadius="full"
                      backgroundColor="gray.600"
                    />
                    <Text color="gray.400" fontSize="sm" lineHeight="1.6">
                      {template.description}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Card>
      ))}

      <Box
        padding={6}
        borderRadius="2xl"
        backgroundColor="rgba(33, 33, 33, 0.2)"
        borderWidth="2px"
        borderColor="gray.700"
        transition="all 0.3s"
        _hover={{
          borderColor: "gray.600",
          transform: "translateY(-4px)",
        }}
      >
        <VStack gap={4} alignItems="flex-start">
          <Heading as="h3" size="md" fontWeight="600" color="white">
            Don't see your use case?
          </Heading>
          <Text color="gray.400" fontSize="sm" lineHeight="1.6">
            Create a custom alert for any blockchain event.
          </Text>
        </VStack>
      </Box>
    </SimpleGrid>
  );
}
