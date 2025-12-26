import { SimpleGrid, VStack, Box, Heading, HStack, Text, FormControl, FormLabel } from "@chakra-ui/react";
import { ProtocolIcon } from "@/app/icons/ProtocolIcon";
import { ChainIcon } from "@/app/icons/ChainIcon";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { useMemo, useState, useEffect } from "react";
import { READY_EVENTS } from "../../../../../data/readyEvents";
import { parseAbiItem } from "viem";
import { Id } from "../../../../../../../convex/_generated/dataModel";

export const TemplatesProtocols = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
  const [pendingTemplateIndex, setPendingTemplateIndex] = useState<number | null>(null);

  const {
    selectedTemplateIndex,
    setSelectedTemplateIndex,
    chains,
    chainId,
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
    if (!template) return;

    setSelectedTemplateIndex(index);
    setContractAddress(template.contract_address || "");
    setEventAbi(template.event_abi);
    setUseTemplate(true);
    setSelectedEventIndex("");
    setSelectedEvent(parseAbiItem(template.event_abi));
    setPendingTemplateIndex(null);

    // If template has only one chain, auto-select it
    if (template.chain_ids.length === 1) {
      const chain = chains?.find((c) => c.chain_id === template.chain_ids[0]);
      if (chain) {
        setChainId(chain._id);
      }
    }
  };

  // Handle chain selection for multi-chain templates
  const handleChainSelect = (chainIdValue: Id<"chains">, templateIndex: number) => {
    const template = READY_EVENTS[templateIndex];
    if (!template) return;

    setChainId(chainIdValue);
    setContractAddress(template.contract_address || "");
    setEventAbi(template.event_abi);
    setUseTemplate(true);
    setSelectedEventIndex("");
    setSelectedEvent(parseAbiItem(template.event_abi));
  };

  // Auto-add conditions for required event arguments when template is selected
  useEffect(() => {
    if (selectedTemplateIndex) {
      const template = READY_EVENTS[selectedTemplateIndex];
      if (!template) return;

      const requiredArgs = template.required?.filter((req) => req !== "contract_address") || [];

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
    const allProtocols = Object.keys(templatesByProtocol);
    const generalDefi = allProtocols.find((p) => p === "General DeFi");
    const otherProtocols = allProtocols.filter((p) => p !== "General DeFi").sort();
    return generalDefi ? [generalDefi, ...otherProtocols] : otherProtocols;
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
          onClick={() => {
            setSelectedProtocol(null);
            setPendingTemplateIndex(null);
          }}
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
          const templateChains = chains?.filter((c: any) => template.chain_ids.includes(c.chain_id)) || [];

          return (
            <Box
              key={originalIndex}
              padding={3}
              borderRadius="md"
              backgroundColor="gray.800"
              borderWidth="1px"
              borderColor={isSelected ? "blue.500" : "gray.700"}
              width="100%"
              cursor="pointer"
              onClick={() => handleTemplateSelect(originalIndex)}
            >
              <VStack alignItems="stretch" gap={3}>
                <Box textAlign="left" transition="all 0.2s" width="100%">
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack alignItems="flex-start" gap={2} flex={1}>
                      <Heading as="h3" size="sm" color="white" fontSize="sm">
                        {template.description}
                      </Heading>
                      <HStack gap={1.5} flexWrap="wrap">
                        {templateChains.map((c: any) => (
                          <Box width="16px" height="16px">
                            <ChainIcon name={c.name} />
                          </Box>
                        ))}
                      </HStack>
                    </HStack>
                    <Text color="blue.400" fontSize="xs" fontFamily="mono">
                      {template.event_abi}
                    </Text>
                  </HStack>
                </Box>

                {isSelected && (
                  <HStack gap={2} flexWrap="wrap">
                    {templateChains.map((chain: any) => {
                      const isChainSelected = chainId === chain._id;
                      return (
                        <Box
                          key={chain._id}
                          as="button"
                          onClick={() => handleChainSelect(chain._id, originalIndex)}
                          paddingX={2}
                          paddingY={1}
                          borderRadius="lg"
                          backgroundColor={isChainSelected ? "blue.500" : "gray.700"}
                          borderWidth="1px"
                          borderColor={isChainSelected ? "blue.400" : "gray.600"}
                          display="flex"
                          alignItems="center"
                          gap={2}
                          transition="all 0.2s"
                          _hover={{
                            backgroundColor: isChainSelected ? "blue.500" : "gray.600",
                            borderColor: isChainSelected ? "blue.400" : "gray.500",
                          }}
                        >
                          <Box
                            width="16px"
                            height="16px"
                            borderRadius="full"
                            overflow="hidden"
                            flexShrink={0}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <ChainIcon name={chain.name} />
                          </Box>
                          <Text color="white" fontSize="sm" fontWeight={isChainSelected ? "500" : "400"}>
                            {chain.name}
                          </Text>
                        </Box>
                      );
                    })}
                  </HStack>
                )}
              </VStack>
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
            onClick={() => {
              setSelectedProtocol(protocol);
              setPendingTemplateIndex(null);
            }}
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
