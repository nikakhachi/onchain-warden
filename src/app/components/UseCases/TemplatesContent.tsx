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

// Protocol-specific max initial items (default: 5)
const PROTOCOL_MAX_ITEMS: Record<string, number> = {
  Reservoir: 4,
  "General DeFi": 3,
  Uniswap: 4,
  Aave: 5,
  Euler: 3,
  Pendle: 4,
  Morpho: 5,
  LayerZero: 3,
  YO: 3,
  InfiniFi: 6,
};

// Component for displaying templates in a compact way
function TemplateList({ templates, protocol }: { templates: typeof SORTED_READY_EVENTS; protocol: string }) {
  const maxInitialItems = PROTOCOL_MAX_ITEMS[protocol] ?? 5;
  const [isExpanded, setIsExpanded] = useState(false);
  const showExpandButton = templates.length > maxInitialItems;
  const displayTemplates = isExpanded ? templates : templates.slice(0, maxInitialItems);

  return (
    <VStack alignItems="flex-start" gap={2} width="100%">
      <Box width="100%">
        <Box display="flex" flexWrap="wrap" gap={2} width="100%">
          {displayTemplates.map((template, index) => (
            <Box
              key={index}
              paddingX={3}
              paddingY={0.5}
              borderRadius="full"
              backgroundColor="rgba(59, 130, 246, 0.1)"
              borderWidth="1px"
              borderColor="rgba(59, 130, 246, 0.2)"
              display="inline-block"
            >
              <Text color="gray.300" fontSize="sm" lineHeight="1.4">
                {template.description}
              </Text>
            </Box>
          ))}
        </Box>
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

  // Sort protocols: "General DeFi" first, then alphabetical
  const sortedProtocols = useMemo(() => {
    const protocols = Object.keys(templatesByProtocol);
    const generalDefi = protocols.find((p) => p === "General DeFi");
    const others = protocols.filter((p) => p !== "General DeFi").sort();
    return generalDefi ? [generalDefi, ...others] : others;
  }, [templatesByProtocol]);

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} width="100%" ref={ref}>
      {sortedProtocols.map((protocol, index) => {
        const templates = templatesByProtocol[protocol];
        return (
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

            <TemplateList templates={templates} protocol={protocol} />
          </VStack>
        </MotionCard>
        );
      })}

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
