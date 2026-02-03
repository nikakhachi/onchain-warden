"use client";

import { Box, Input, VStack, FormControl, FormLabel, HStack, Text } from "@chakra-ui/react";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { SwitchButton } from "@/app/components/SwitchButton";
import { SeverityDropdown } from "@/app/components/SeverityDropdown";
import { ManualSetup } from "./ManualSetup";
import { TemplatesProtocols } from "./TemplatesProtocols";
import { SEVERITY_COLORS } from "@/app/shared/severities";
import { READY_EVENTS } from "@/app/shared/data/readyEvents";

export function Step1EventSource() {
  const {
    useTemplate,
    setUseTemplate,
    watcherLabel,
    setWatcherLabel,
    severity,
    setSeverity,
    setSelectedTemplateIndex,
    setContractAddress,
    setEventAbi,
    setSelectedEvent,
    setSelectedEventIndex,
    setConditions,
  } = useCreateWatcher();

  const handleSwitchToManual = () => {
    setUseTemplate(false);
    // Reset all template-related state
    setSelectedTemplateIndex(null);
    setContractAddress("");
    setEventAbi("");
    setSelectedEvent(null);
    setSelectedEventIndex("");
    // Remove required conditions that were added by template
    setConditions((prev) => prev.filter((c) => !c.required));
  };

  return (
    <VStack alignItems="stretch" gap={4}>
      <VStack alignItems="center" width="100%" gap={2}>
        <Box
          display="flex"
          gap={2}
          padding={1.5}
          borderRadius="lg"
          backgroundColor="gray.800"
          borderWidth="1px"
          borderColor="gray.700"
          width="fit-content"
        >
          <SwitchButton active={!useTemplate} onClick={handleSwitchToManual} label="Manual Setup" />
          <SwitchButton
            active={useTemplate}
            onClick={() => setUseTemplate(true)}
            label={`Use Template (${READY_EVENTS.length})`}
          />
        </Box>
        <Text color="gray.500" fontSize="xs" textAlign="center" mb={-4} mt={-1}>
          {useTemplate ? "Pick a pre-configured alert from popular protocols" : "Setup an alert for any on-chain event"}
        </Text>
      </VStack>

      <HStack gap={4} alignItems="flex-start" width="100%">
        <FormControl width="fit-content" flexShrink={0}>
          <FormLabel color="gray.300" marginBottom={1} display="flex" alignItems="center" gap={2}>
            <Box backgroundColor={SEVERITY_COLORS[severity]} width="10px" height="10px" borderRadius="full" /> Severity
          </FormLabel>
          <SeverityDropdown value={severity} onChange={setSeverity} />
        </FormControl>
        <FormControl isRequired flex={1}>
          <FormLabel color="gray.300" marginBottom={1}>
            Alert Label
          </FormLabel>
          <Input
            value={watcherLabel}
            onChange={(e) => setWatcherLabel(e.target.value)}
            placeholder="A friendly name to identify this alert in notifications"
            backgroundColor="gray.800"
            borderColor="gray.700"
            color="white"
          />
        </FormControl>
      </HStack>

      {useTemplate ? <TemplatesProtocols /> : <ManualSetup />}
    </VStack>
  );
}
