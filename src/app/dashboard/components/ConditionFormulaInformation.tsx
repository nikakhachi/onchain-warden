import { InfoIcon } from "@chakra-ui/icons";
import { Tooltip, VStack, Box, Icon, Text } from "@chakra-ui/react";

const availableFunctions = ["pow", "sqrt", "abs", "exp", "min", "max", "floor", "ceil", "round"];
const availableVariables = ["value", "x"];
const availableOperators = [">", "<", ">=", "<=", "==", "!="];

const examples = [
  "round((value / 1e18) * 3.154e7, 2) > 10.5",
  "(pow(1 + value / 1e18, 365) - 1) * 100 > 5.25",
  "value / 1e6 * 100 >= 50.75",
  "round(value / 1e18 * 100, 2) < 1000.99",
  "min(max(value / 1.549e18, 0), 1000) <= 500.5",
  "abs(value - 1e18) / 1e18 * 100 != 0.01",
  "pow(1 + value / 1e18, 12) - 1 >= 0.15",
  "floor(value / 1e18 / 100) * 100 == 10000.0",
  "round(min(value / 1e18, 100) * 1.5, 2) > 75.25",
  "ceil(value / 1e18 / 1000) * 1000 <= 20000.5",
  "value * 2.5 + 10.75 > 100.5",
  "sqrt(value / 1e18) * 100 >= 15.25",
  "round(value / 1e6, 3) < 999.999",
];

export const ConditionFormulaInformation = () => {
  return (
    <Tooltip
      label={
        <VStack alignItems="flex-start" gap={2} fontSize="xs">
          <Text>
            The <strong>value</strong> variable refers to the actual argument value. The formula must include a
            comparison operator (&gt;, &lt;, &gt;=, &lt;=, ==, !=) followed by a number.
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
              Available operators:
            </Text>
            <Text>{availableOperators.join(", ")}</Text>
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
      maxW="500px"
      hasArrow
      placement="right"
    >
      <Icon as={InfoIcon} color="gray.400" _hover={{ color: "gray.300" }} cursor="help" />
    </Tooltip>
  );
};
