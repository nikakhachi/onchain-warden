"use client";

import { Icon, Tooltip, Box, Text } from "@chakra-ui/react";
import { FaCircleInfo } from "react-icons/fa6";

export function PercentageDifferenceInformation() {
  return (
    <Tooltip
      label={
        <Box>
          <Text fontWeight="bold" marginBottom={2}>
            Percentage Difference Condition
          </Text>
          <Text marginBottom={2}>
            This condition compares the current value with the previous one and triggers an alert when the percentage
            change exceeds your threshold.
          </Text>
          <Text fontWeight="semibold" marginBottom={1} marginTop={3}>
            Example 1: APY Monitoring
          </Text>
          <Text marginBottom={2}>
            If the APY was 10% previously and you set the threshold to 10%, the alert will fire when:
          </Text>
          <Text marginBottom={1}>• APY increases to 11% or more (10% increase from 10%)</Text>
          <Text marginBottom={3}>• APY decreases to 9% or less (10% decrease from 10%)</Text>
          <Text fontWeight="semibold" marginBottom={1}>
            Example 2: Vault Cap Monitoring
          </Text>
          <Text marginBottom={2}>
            If the vault cap was 10M previously and you set the threshold to 5%, the alert will fire when:
          </Text>
          <Text marginBottom={1}>• Vault cap increases to 10.5M or more (5% increase from 10M)</Text>
          <Text>• Vault cap decreases to 9.5M or less (5% decrease from 10M)</Text>
        </Box>
      }
      backgroundColor="gray.800"
      color="white"
      padding={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.700"
      maxW="500px"
      hasArrow
    >
      <Icon as={FaCircleInfo} color="gray.400" _hover={{ color: "gray.300" }} cursor="help" />
    </Tooltip>
  );
}
