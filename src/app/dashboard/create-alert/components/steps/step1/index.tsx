"use client";

import { Box, Input, Text, VStack } from "@chakra-ui/react";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { SwitchButton } from "@/app/components/SwitchButton";
import { ManualSetup } from "./ManualSetup";
import { TemplatesProtocols } from "./TemplatesProtocols";

export function Step1EventSource() {
  const { useTemplate, setUseTemplate, watcherLabel, setWatcherLabel } =
    useCreateWatcher();

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
          <SwitchButton
            active={!useTemplate}
            onClick={() => setUseTemplate(false)}
            label="Manual Setup"
          />
          <SwitchButton
            active={useTemplate}
            onClick={() => setUseTemplate(true)}
            label="Use Template"
          />
        </Box>
      </Box>

      <VStack alignItems="flex-start" gap={2}>
        <Text color="gray.300" fontSize="sm" fontWeight="500">
          Alert Label
        </Text>
        <Input
          value={watcherLabel}
          onChange={(e) => setWatcherLabel(e.target.value)}
          placeholder="e.g., USDT Whale Tracker"
          backgroundColor="gray.800"
          borderColor="gray.700"
          color="white"
          width="100%"
        />
        <Text color="gray.400" fontSize="xs">
          A friendly name to identify this alert in notifications
        </Text>
      </VStack>

      {useTemplate ? <TemplatesProtocols /> : <ManualSetup />}
    </VStack>
  );
}
