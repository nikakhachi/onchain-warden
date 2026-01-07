"use client";

import { Box, Input, Text, VStack, FormControl, FormLabel } from "@chakra-ui/react";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { SwitchButton } from "@/app/components/SwitchButton";
import { ManualSetup } from "./ManualSetup";
import { TemplatesProtocols } from "./TemplatesProtocols";

export function Step1EventSource() {
  const {
    useTemplate,
    setUseTemplate,
    watcherLabel,
    setWatcherLabel,
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
      <Box display="flex" justifyContent="center" width="100%">
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
          <SwitchButton active={useTemplate} onClick={() => setUseTemplate(true)} label="Use Template" />
        </Box>
      </Box>

      <FormControl isRequired>
        <FormLabel color="gray.300">Alert Label</FormLabel>
        <Input
          value={watcherLabel}
          onChange={(e) => setWatcherLabel(e.target.value)}
          placeholder="e.g., Supply cap change of X token on Y protocol"
          backgroundColor="gray.800"
          borderColor="gray.700"
          color="white"
        />
        <Text color="gray.400" fontSize="xs" marginTop={1}>
          A friendly name to identify this alert in notifications
        </Text>
      </FormControl>

      {useTemplate ? <TemplatesProtocols /> : <ManualSetup />}
    </VStack>
  );
}
