import {
  SimpleGrid,
  VStack,
  Box,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/react";
import { ProtocolIcon } from "@/app/icons/ProtocolIcon";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { useMemo, useState, useEffect } from "react";
import { READY_EVENTS } from "../../../../../data/readyEvents";
import { parseAbiItem } from "viem";

export const TemplatesProtocols = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);

  const {
    selectedTemplateIndex,
    setSelectedTemplateIndex,
    chains,
    setChainId,
    setContractAddress,
    setEventAbi,
    setUseTemplate,
    setSelectedEventIndex,
    setSelectedEvent,
    setConditions,
  } = useCreateWatcher();

  // Handle template selection
  const handleTemplateSelect = (index: number) => {
    const template = READY_EVENTS[index];
    if (template) {
      setSelectedTemplateIndex(index);
      setChainId(chains?.find((c) => c.chain_id === template.chain_id)?._id);
      setContractAddress(template.contract_address || "");
      setEventAbi(template.event_abi);
      setUseTemplate(true);
      setSelectedEventIndex("");
      setSelectedEvent(parseAbiItem(template.event_abi));
    }
  };

  // Auto-add conditions for required event arguments when template is selected
  useEffect(() => {
    if (selectedTemplateIndex) {
      const template = READY_EVENTS[selectedTemplateIndex];
      if (!template) return;

      const requiredArgs =
        template.required?.filter((req) => req !== "contract_address") || [];

      // Remove all required conditions from previous template
      setConditions((prevConditions) => {
        const nonRequiredConditions = prevConditions.filter((c) => !c.required);

        // Add new required conditions for current template
        const newRequiredConditions = requiredArgs.map((reqArg) => ({
          field: reqArg,
          operator: "==",
          value: "",
          required: true,
        }));

        // Combine non-required conditions with new required conditions
        return [...nonRequiredConditions, ...newRequiredConditions];
      });
    }
  }, [selectedTemplateIndex]);

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

  // Get unique protocols
  const protocols = useMemo(() => {
    return Object.keys(templatesByProtocol).sort();
  }, [templatesByProtocol]);

  // Get templates for selected protocol
  const selectedProtocolTemplates = useMemo(() => {
    if (!selectedProtocol) return [];
    return templatesByProtocol[selectedProtocol] || [];
  }, [selectedProtocol, templatesByProtocol]);

  return selectedProtocol ? (
    // Template list view for selected protocol
    <VStack alignItems="stretch" gap={3}>
      <HStack alignItems="center" gap={2}>
        <Box
          as="button"
          onClick={() => setSelectedProtocol(null)}
          padding={1.5}
          borderRadius="md"
          _hover={{ backgroundColor: "gray.700" }}
        >
          <Text color="white" fontSize="xs">
            ← Back
          </Text>
        </Box>
        <HStack gap={1.5}>
          <Box width="20px" height="20px" flexShrink={0}>
            <ProtocolIcon name={selectedProtocol} />
          </Box>
          <Heading as="h2" size="sm" color="white" fontSize="sm">
            {selectedProtocol}
          </Heading>
        </HStack>
      </HStack>

      <VStack alignItems="stretch" gap={2}>
        {selectedProtocolTemplates.map((template) => {
          const originalIndex = READY_EVENTS.findIndex((t) => t === template);
          const isSelected = selectedTemplateIndex === originalIndex;
          const chainName =
            chains?.find((c: any) => c.chain_id === template.chain_id)?.name ||
            "Ethereum";

          return (
            <Box
              key={originalIndex}
              as="button"
              padding={3}
              borderRadius="md"
              backgroundColor="gray.800"
              borderWidth="1px"
              borderColor={isSelected ? "blue.500" : "gray.700"}
              textAlign="left"
              onClick={() => handleTemplateSelect(originalIndex)}
              transition="all 0.2s"
              _hover={{
                borderColor: isSelected ? "blue.500" : "gray.600",
              }}
              width="100%"
            >
              <HStack justifyContent="space-between" alignItems="center">
                <VStack alignItems="flex-start" gap={0.5} flex={1}>
                  <Heading as="h3" size="sm" color="white" fontSize="sm">
                    {template.description}
                  </Heading>
                  <HStack gap={1.5}>
                    <Box
                      width="6px"
                      height="6px"
                      borderRadius="full"
                      backgroundColor="blue.500"
                    />
                    <Text color="gray.400" fontSize="xs">
                      {chainName}
                    </Text>
                  </HStack>
                </VStack>
                <Text color="blue.400" fontSize="xs" fontFamily="mono">
                  {template.event_abi}
                </Text>
              </HStack>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  ) : (
    // Protocol cards view
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={3}>
      {protocols.map((protocol) => {
        const templateCount = templatesByProtocol[protocol].length;

        return (
          <Box
            key={protocol}
            as="button"
            padding={4}
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
            textAlign="left"
            onClick={() => setSelectedProtocol(protocol)}
            transition="all 0.2s"
            _hover={{
              borderColor: "gray.600",
              backgroundColor: "gray.700",
            }}
            width="100%"
          >
            <VStack alignItems="flex-start" gap={4} width="100%">
              <HStack gap={2} alignItems="flex-end">
                <Box width="24px" height="24px" flexShrink={0}>
                  <ProtocolIcon name={protocol} />
                </Box>
                <Heading as="h3" color="white" fontSize="lg">
                  {protocol}
                </Heading>
              </HStack>

              <HStack justifyContent="space-between" width="100%">
                <Text color="gray.400" fontSize="xs">
                  {templateCount} template{templateCount !== 1 ? "s" : ""} →
                </Text>
              </HStack>
            </VStack>
          </Box>
        );
      })}
    </SimpleGrid>
  );
};
