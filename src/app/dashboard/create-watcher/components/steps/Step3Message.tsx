"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  Checkbox,
  SimpleGrid,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { ChangeEvent } from "react";
import { Preview } from "../Preview";

const MessageCheckbox = ({
  isChecked,
  onChange,
  label,
}: {
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) => (
  <Checkbox
    isChecked={isChecked}
    onChange={(e) => onChange(e)}
    borderColor="gray.700"
    borderWidth="1px"
    p={2}
    borderRadius="lg"
  >
    <Text color="white" fontSize="sm" marginLeft={2}>
      {label}
    </Text>
  </Checkbox>
);

export function Step3Message() {
  const { displayConfig, setDisplayConfig, eventArgs } = useCreateWatcher();

  const handleCheckboxChange = (
    field: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setDisplayConfig({ ...displayConfig, [field]: e.target.checked });
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      <Preview />

      {/* Event Arguments */}
      {eventArgs.length > 0 && (
        <VStack alignItems="flex-start" gap={4}>
          <VStack alignItems="flex-start" gap={2}>
            <Heading as="h3" size="md" color="white">
              Event Arguments
            </Heading>
            <Text color="gray.400" fontSize="sm">
              Configure how event arguments are displayed
            </Text>
          </VStack>

          <Box
            width="100%"
            overflowX="auto"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="gray.700"
            backgroundColor="gray.800"
          >
            <Table variant="unstyled" size="sm" width="100%">
              <Thead backgroundColor="gray.800">
                <Tr borderBottomWidth="1px" borderBottomColor="gray.700">
                  <Th
                    padding={3}
                    textAlign="left"
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    width="60px"
                    borderBottomWidth="1px"
                    borderBottomColor="gray.700"
                  >
                    Show
                  </Th>
                  <Th
                    padding={3}
                    textAlign="left"
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    borderBottomWidth="1px"
                    borderBottomColor="gray.700"
                  >
                    Argument
                  </Th>
                  <Th
                    padding={3}
                    textAlign="left"
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    borderBottomWidth="1px"
                    borderBottomColor="gray.700"
                  >
                    Type
                  </Th>
                  <Th
                    padding={3}
                    textAlign="left"
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    borderBottomWidth="1px"
                    borderBottomColor="gray.700"
                  >
                    Custom Label
                  </Th>
                  <Th
                    padding={3}
                    textAlign="left"
                    color="gray.400"
                    fontSize="xs"
                    fontWeight="600"
                    textTransform="uppercase"
                    borderBottomWidth="1px"
                    borderBottomColor="gray.700"
                  >
                    Decimals
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {eventArgs.map((arg: any, index: number) => {
                  const argKey = arg.name || arg.internalType || `arg${index}`;
                  const argConfig = displayConfig.args.find(
                    (a: { key: string; label?: string; decimals?: number }) =>
                      a.key === argKey
                  );
                  const isChecked = argConfig !== undefined;
                  const isUint = arg.type?.includes("uint");

                  const handleToggle = (checked: boolean) => {
                    if (checked) {
                      const updated = [...displayConfig.args];
                      updated.push({
                        key: argKey,
                        label: argKey,
                        decimals: isUint ? 18 : undefined,
                      });
                      setDisplayConfig({ ...displayConfig, args: updated });
                    } else {
                      const updated = displayConfig.args.filter(
                        (a: { key: string }) => a.key !== argKey
                      );
                      setDisplayConfig({ ...displayConfig, args: updated });
                    }
                  };

                  const handleLabelChange = (value: string) => {
                    const updated = displayConfig.args.map((a: any) =>
                      a.key === argKey ? { ...a, label: value } : a
                    );
                    setDisplayConfig({ ...displayConfig, args: updated });
                  };

                  const handleDecimalsChange = (value: number) => {
                    const updated = displayConfig.args.map((a: any) =>
                      a.key === argKey ? { ...a, decimals: value } : a
                    );
                    setDisplayConfig({ ...displayConfig, args: updated });
                  };

                  return (
                    <Tr
                      key={index}
                      borderBottomWidth="1px"
                      borderBottomColor="gray.700"
                      _hover={{ backgroundColor: "gray.800" }}
                    >
                      <Td
                        padding={3}
                        borderBottomWidth="1px"
                        borderBottomColor="gray.700"
                      >
                        <Checkbox
                          isChecked={isChecked}
                          onChange={(e) => handleToggle(e.target.checked)}
                          colorScheme="blue"
                        />
                      </Td>
                      <Td
                        padding={3}
                        borderBottomWidth="1px"
                        borderBottomColor="gray.700"
                      >
                        <Text color="white" fontSize="sm">
                          {argKey}
                        </Text>
                      </Td>
                      <Td
                        padding={3}
                        borderBottomWidth="1px"
                        borderBottomColor="gray.700"
                      >
                        <Badge
                          backgroundColor="gray.700"
                          color="gray.300"
                          paddingX={2}
                          paddingY={1}
                          borderRadius="md"
                          fontSize="xs"
                        >
                          {arg.type || "unknown"}
                        </Badge>
                      </Td>
                      <Td
                        padding={3}
                        borderBottomWidth="1px"
                        borderBottomColor="gray.700"
                      >
                        {isChecked ? (
                          <Input
                            value={argConfig?.label || ""}
                            onChange={(e) => handleLabelChange(e.target.value)}
                            placeholder={argKey}
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="white"
                            fontSize="sm"
                            size="sm"
                          />
                        ) : (
                          <Input
                            value=""
                            placeholder={argKey}
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="gray.500"
                            fontSize="sm"
                            size="sm"
                            disabled
                          />
                        )}
                      </Td>
                      <Td
                        padding={3}
                        borderBottomWidth="1px"
                        borderBottomColor="gray.700"
                      >
                        {isUint && isChecked ? (
                          <Input
                            type="number"
                            value={argConfig?.decimals || 18}
                            onChange={(e) =>
                              handleDecimalsChange(
                                parseInt(e.target.value) || 18
                              )
                            }
                            placeholder="e.g., 18"
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="white"
                            fontSize="sm"
                            size="sm"
                          />
                        ) : (
                          <Text color="gray.500" fontSize="sm">
                            N/A
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      )}

      <VStack alignItems="flex-start" gap={4}>
        <Heading as="h3" size="md" color="white">
          Message Fields
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Select which fields to include in notifications
        </Text>
        <SimpleGrid columns={5} gap={3} width="100%">
          <MessageCheckbox
            isChecked={displayConfig.timestamp}
            onChange={(e) => handleCheckboxChange("timestamp", e)}
            label="Timestamp"
          />
          <MessageCheckbox
            isChecked={displayConfig.label}
            onChange={(e) => handleCheckboxChange("label", e)}
            label="Watcher Label"
          />
          <MessageCheckbox
            isChecked={displayConfig.chain}
            onChange={(e) => handleCheckboxChange("chain", e)}
            label="Chain Name"
          />
          <MessageCheckbox
            isChecked={displayConfig.contract_address}
            onChange={(e) => handleCheckboxChange("contract_address", e)}
            label="Contract Address"
          />
          <MessageCheckbox
            isChecked={displayConfig.event_abi}
            onChange={(e) => handleCheckboxChange("event_abi", e)}
            label="Event ABI"
          />
          <MessageCheckbox
            isChecked={displayConfig.explorer_link}
            onChange={(e) => handleCheckboxChange("explorer_link", e)}
            label="Explorer Link"
          />
          <MessageCheckbox
            isChecked={displayConfig.layerzer_link}
            onChange={(e) => handleCheckboxChange("layerzer_link", e)}
            label="LayerZero Link"
          />
        </SimpleGrid>
      </VStack>
    </VStack>
  );
}
