import { FaCircleInfo } from "react-icons/fa6";
import { Tooltip, VStack, Box, Icon, Text } from "@chakra-ui/react";

const availableFunctions = ["pow", "sqrt", "abs", "exp", "min", "max", "floor", "ceil", "round"];
const availableVariables = ["value", "x"];

const examples = [
  "(pow(1 + value / 1e18, 365) - 1) * 100",
  "round(value / 1e18, 4)",
  "value / 1e6 * 100",
  "round(value / 1e18 * 100, 2)",
  "min(max(value / 1.549e18, 0), 1000)",
  "abs(value - 1e18) / 1e18 * 100",
  "pow(1 + value / 1e18, 12) - 1",
  "floor(value / 1e18 / 100) * 100",
  "round(min(value / 1e18, 100) * 1.5, 2)",
  "ceil(value / 1e18 / 1000) * 1000",
];

export const FormulaInformation = () => {
  return (
    <Tooltip
      label={
        <VStack alignItems="flex-start" gap={2} fontSize="xs">
          <Text>
            The <strong>value</strong> variable in the formula refers to the actual argument value.
          </Text>
          <Box>
            <Text fontWeight="semibold" marginBottom={1}>
              Available functions:
            </Text>
            <Text>{availableFunctions.join(", ")}</Text>
          </Box>
          <Box>
            <Text fontWeight="semibold" marginBottom={1}>
              Available variables:
            </Text>
            <Text>{availableVariables.join(", ")} (both refer to the argument value)</Text>
          </Box>
          <Box>
            <Text fontWeight="semibold" marginBottom={1}>
              Examples:
            </Text>
            <VStack alignItems="flex-start" gap={1}>
              {examples.map((example, index) => (
                <Text key={index} fontFamily="mono" fontSize="xs">
                  - {example}
                </Text>
              ))}
            </VStack>
          </Box>
        </VStack>
      }
      backgroundColor="gray.800"
      color="white"
      padding={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor="gray.700"
      maxW="400px"
      hasArrow
    >
      <Icon as={FaCircleInfo} color="gray.400" _hover={{ color: "gray.300" }} cursor="help" />
    </Tooltip>
  );
};
