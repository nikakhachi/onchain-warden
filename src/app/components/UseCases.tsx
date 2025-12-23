"use client";

import { useState } from "react";
import { Box, Container, Heading, Text, VStack } from "@chakra-ui/react";
import { GRADIENTS } from "../theme";
import { READY_EVENTS } from "../data/readyEvents";
import { UseCasesContent } from "./UseCasesContent";
import { TemplatesContent } from "./TemplatesContent";

const SwitchButton = ({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) => (
  <Box
    as="button"
    paddingX={4}
    paddingY={2}
    borderRadius="md"
    backgroundImage={active ? GRADIENTS.button : "none"}
    backgroundColor={active ? "transparent" : "transparent"}
    color={active ? "white" : "gray.400"}
    onClick={onClick}
    fontWeight={active ? "600" : "500"}
    fontSize="sm"
    transition="all 0.2s"
    _hover={{
      backgroundImage: active ? GRADIENTS.button : "none",
      backgroundColor: active ? "transparent" : "gray.700",
      color: active ? "white" : "gray.300",
      opacity: active ? 0.9 : 1,
    }}
  >
    {label}
  </Box>
);

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
              <SwitchButton
                active={!showTemplates}
                onClick={() => setShowTemplates(false)}
                label="Use Cases"
              />
              <SwitchButton
                active={showTemplates}
                onClick={() => setShowTemplates(true)}
                label={`Templates (${READY_EVENTS.length})`}
              />
            </Box>
          </VStack>
          {!showTemplates ? <UseCasesContent /> : <TemplatesContent />}
        </VStack>
      </Container>
    </Box>
  );
}
