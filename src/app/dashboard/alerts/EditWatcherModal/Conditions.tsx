import { CloseIcon } from "@chakra-ui/icons";
import { TabPanel, VStack, Box, HStack, Select, Input, Text } from "@chakra-ui/react";
import { Condition, EventArg } from ".";
import { Button as CustomButton } from "../../../components/Button";

export const Conditions = ({
  conditions,
  setConditions,
  eventArgs,
}: {
  conditions: Condition[];
  setConditions: (conditions: Condition[]) => void;
  eventArgs: EventArg[];
}) => {
  const getOperators = (argType: string) => {
    if (argType?.includes("uint") || argType?.includes("int")) {
      return ["==", "!=", ">", ">=", "<", "<="];
    }
    return ["==", "!="];
  };

  const getOperatorLabel = (op: string) => {
    const labels: Record<string, string> = {
      "==": "Equals",
      "!=": "Not Equals",
      ">": "Greater Than",
      ">=": "Greater Than or Equal",
      "<": "Less Than",
      "<=": "Less Than or Equal",
    };
    return labels[op] || op;
  };

  const addCondition = () => {
    setConditions([...conditions, { field: eventArgs[0]?.name || "", operator: ">=", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: keyof Condition, value: string) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  return (
    <TabPanel paddingX={0} paddingTop={4}>
      <VStack gap={4} alignItems="stretch">
        {conditions.length === 0 ? (
          <Box
            padding={6}
            textAlign="center"
            borderRadius="lg"
            backgroundColor="gray.800"
            borderWidth="1px"
            borderColor="gray.700"
          >
            <Text color="gray.400" fontSize="sm">
              No conditions set
            </Text>
          </Box>
        ) : (
          <VStack gap={3} alignItems="stretch" maxH="300px" overflowY="auto">
            {conditions.map((condition, index) => {
              const arg = eventArgs.find((a: { name: string; type: string }) => a.name === condition.field);
              const availableOperators = getOperators(arg?.type || "");

              return (
                <HStack key={index} gap={3} alignItems="flex-start">
                  <Select
                    flex={1}
                    value={condition.field}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateCondition(index, "field", e.target.value)
                    }
                    backgroundColor="gray.800"
                    borderColor="gray.700"
                    color="white"
                  >
                    {eventArgs.map((arg: { name: string; type: string }, argIndex: number) => (
                      <option key={argIndex} value={arg.name}>
                        {arg.name} ({arg.type})
                      </option>
                    ))}
                  </Select>
                  <Select
                    flex={1}
                    value={condition.operator}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateCondition(index, "operator", e.target.value)
                    }
                    backgroundColor="gray.800"
                    borderColor="gray.700"
                    color="white"
                  >
                    {availableOperators.map((op) => (
                      <option key={op} value={op}>
                        {getOperatorLabel(op)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    flex={1}
                    value={condition.value}
                    onChange={(e) => updateCondition(index, "value", e.target.value)}
                    placeholder="Value"
                    backgroundColor="gray.800"
                    borderColor="gray.700"
                    color="white"
                  />
                  <Box as="button" onClick={() => removeCondition(index)} padding={2}>
                    <CloseIcon fontSize="xs" color="gray.400" />
                  </Box>
                </HStack>
              );
            })}
          </VStack>
        )}
        <CustomButton variant="secondary" size="sm" onClick={addCondition} alignSelf="flex-start">
          + Add Condition
        </CustomButton>
      </VStack>
    </TabPanel>
  );
};
