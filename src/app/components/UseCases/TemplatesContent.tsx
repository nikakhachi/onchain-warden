"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Box, Heading, Text, VStack, SimpleGrid, HStack, Button as ChakraButton } from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { SORTED_READY_EVENTS } from "../../shared/data/readyEvents";
import { Card } from "../Card";
import { ProtocolIcon } from "../../icons/ProtocolIcon";
import { Button } from "../Button";

const MotionCard = motion(Card);

// Component for displaying templates in a compact way
function TemplateList({ templates }: { templates: typeof SORTED_READY_EVENTS }) {
  const maxInitialItems = 5;
  const [isExpanded, setIsExpanded] = useState(false);
  const showExpandButton = templates.length > maxInitialItems;
  const displayTemplates = isExpanded ? templates : templates.slice(0, maxInitialItems);

  return (
    <VStack alignItems="flex-start" gap={2} width="100%">
      <Box
        width="100%"
        maxHeight={isExpanded ? "400px" : "none"}
        overflowY={isExpanded ? "auto" : "visible"}
        css={{
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "3px",
          },
        }}
      >
        <VStack alignItems="flex-start" gap={1.5} width="100%">
          <Text color="gray.400" fontSize="sm" lineHeight="1.6">
            {displayTemplates.map((template, index) => `${template.description}`).join(" • ")}
          </Text>
        </VStack>
      </Box>
      {showExpandButton && (
        <ChakraButton
          variant="ghost"
          size="xs"
          color="gray.400"
          _hover={{ color: "gray.300" }}
          onClick={() => setIsExpanded(!isExpanded)}
          alignSelf="flex-start"
          paddingX={2}
          paddingY={1}
          height="auto"
          minHeight="auto"
        >
          {isExpanded ? "Show less" : `+${templates.length - maxInitialItems} more`}
        </ChakraButton>
      )}
    </VStack>
  );
}

export function TemplatesContent() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  // Group templates by protocol
  const templatesByProtocol = useMemo(() => {
    const grouped: Record<string, typeof SORTED_READY_EVENTS> = {};
    SORTED_READY_EVENTS.forEach((template) => {
      if (!grouped[template.protocol]) {
        grouped[template.protocol] = [];
      }
      grouped[template.protocol].push(template);
    });
    return grouped;
  }, []);

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%" ref={ref}>
      {Object.entries(templatesByProtocol).map(([protocol, templates], index) => (
        <MotionCard
          key={protocol}
          display="flex"
          flexDirection="column"
          height="100%"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          <VStack gap={4} alignItems="flex-start" flex={1} height="100%" width="100%">
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

            <TemplateList templates={templates} />
          </VStack>
        </MotionCard>
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
        display="flex"
        flexDirection="column"
        height="100%"
      >
        <VStack gap={4} alignItems="flex-start" flex={1} height="100%" width="100%">
          <Heading as="h3" size="md" fontWeight="600" color="white">
            Don't see your use case?
          </Heading>
          <Text color="gray.400" fontSize="sm" lineHeight="1.6">
            Create a custom alert for ANY blockchain event. No limitations.
          </Text>
          <Box marginTop="auto" width="fit-content">
            <Link href="/dashboard/alerts">
              <Button variant="primary" size="sm">
                Create Custom Alert
              </Button>
            </Link>
          </Box>
        </VStack>
      </Box>
    </SimpleGrid>
  );
}
