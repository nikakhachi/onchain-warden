import { FaCircleInfo } from "react-icons/fa6";
import { Tooltip, VStack, Box, Icon, Text } from "@chakra-ui/react";

const availableFunctions = ["pow", "sqrt", "abs", "exp", "min", "max", "floor", "ceil", "round"];
const availableVariables = ["value", "x"];

const examples = [
  "(pow(1 + value / 1e18, 365) - 1) * 100",
  "round(value / 1e18, 4)",
  "value / 1e6 * 100",
  // "round(value / 1e18 * 100, 2)",
  "min(max(value / 1.549e18, 0), 1000)",
  "abs(value - 1e18) / 1e18 * 100",
  // "pow(1 + value / 1e18, 12) - 1",
  "floor(value / 1e18 / 100) * 100",
  // "round(min(value / 1e18, 100) * 1.5, 2)",
  "ceil(value / 1e18 / 1000) * 1000",
];

export const FormulaInformation = () => {
  return (
    <Tooltip
      label={
        <VStack alignItems="flex-start" gap={3} fontSize="xs">
          <Box>
            <Text fontWeight="semibold" marginBottom={1}>
              Decimals Format
            </Text>
            <Text>
              Divides the raw value by 10^decimals. For example, enter 18 for most ERC-20 tokens to convert wei to
              human-readable amounts.
            </Text>
          </Box>
          <Box borderTopWidth="1px" borderTopColor="gray.600" paddingTop={3} width="100%">
            <Text fontWeight="semibold" marginBottom={1}>
              Formula Format
            </Text>
            <Text marginBottom={2}>
              Custom math expression using <strong>value</strong> as the raw argument value.
            </Text>
            <Box marginBottom={2}>
              <Text fontWeight="semibold" marginBottom={1}>
                Available functions:
              </Text>
              <Text>{availableFunctions.join(", ")}</Text>
            </Box>
            <Box>
              <Text fontWeight="semibold" marginBottom={1}>
                Examples:
              </Text>
              <VStack alignItems="flex-start" gap={0.5}>
                {examples.map((example, index) => (
                  <Text key={index} fontFamily="mono" fontSize="xs">
                    {example}
                  </Text>
                ))}
              </VStack>
            </Box>
          </Box>
        </VStack>
      }
      backgroundColor="gray.800"
      color="white"
      padding={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.700"
      maxW="420px"
      hasArrow
    >
      <Icon as={FaCircleInfo} color="gray.400" _hover={{ color: "gray.300" }} cursor="help" />
    </Tooltip>
  );
};
