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
} from "@chakra-ui/react";
import { useCreateWatcher } from "../context/CreateWatcherContext";
import { ChangeEvent } from "react";

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

  const updateArgConfig = (
    index: number,
    field: "label" | "decimals",
    value: string | number
  ) => {
    const updated = [...displayConfig.args];
    updated[index] = { ...updated[index], [field]: value };
    setDisplayConfig({ ...displayConfig, args: updated });
  };

  const handleCheckboxChange = (
    field: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    setDisplayConfig({ ...displayConfig, [field]: e.target.checked });
  };

  return (
    <VStack alignItems="stretch" gap={6}>
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

          {eventArgs.map((arg: any, index: number) => {
            const argConfig = displayConfig.args.find(
              (a: { key: string; label?: string; decimals?: number }) =>
                a.key === (arg.name || arg.internalType || `arg${index}`)
            );
            const isChecked = argConfig !== undefined;

            return (
              <Box
                key={index}
                padding={4}
                borderRadius="lg"
                backgroundColor="gray.800"
                borderWidth="1px"
                borderColor="gray.700"
                width="100%"
              >
                <VStack alignItems="flex-start" gap={3}>
                  <HStack gap={2}>
                    <Checkbox
                      isChecked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const updated = [...displayConfig.args];
                          updated.push({
                            key: arg.name || arg.internalType || `arg${index}`,
                            label:
                              arg.name || arg.internalType || `arg${index}`,
                            decimals: arg.type?.includes("uint")
                              ? 18
                              : undefined,
                          });
                          setDisplayConfig({ ...displayConfig, args: updated });
                        } else {
                          const updated = displayConfig.args.filter(
                            (a: {
                              key: string;
                              label?: string;
                              decimals?: number;
                            }) =>
                              a.key !==
                              (arg.name || arg.internalType || `arg${index}`)
                          );
                          setDisplayConfig({ ...displayConfig, args: updated });
                        }
                      }}
                      colorScheme="blue"
                    >
                      <Text
                        color="white"
                        fontSize="sm"
                        fontWeight="500"
                        marginLeft={2}
                      >
                        {arg.name || arg.internalType || `arg${index}`}
                      </Text>
                    </Checkbox>
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
                  </HStack>

                  {isChecked && (
                    <VStack alignItems="flex-start" gap={2} width="100%">
                      <VStack alignItems="flex-start" gap={1} width="100%">
                        <Text color="gray.400" fontSize="xs">
                          Custom Label (optional)
                        </Text>
                        <Input
                          value={argConfig?.label || ""}
                          onChange={(e) =>
                            updateArgConfig(index, "label", e.target.value)
                          }
                          placeholder={arg.name || `arg${index}`}
                          backgroundColor="gray.900"
                          borderColor="gray.700"
                          color="white"
                          fontSize="sm"
                        />
                      </VStack>
                      {arg.type?.includes("uint") && (
                        <VStack alignItems="flex-start" gap={1} width="100%">
                          <Text color="gray.400" fontSize="xs">
                            Decimals (for formatting)
                          </Text>
                          <Input
                            type="number"
                            value={argConfig?.decimals || 18}
                            onChange={(e) =>
                              updateArgConfig(
                                index,
                                "decimals",
                                parseInt(e.target.value) || 18
                              )
                            }
                            placeholder="e.g., 18"
                            backgroundColor="gray.900"
                            borderColor="gray.700"
                            color="white"
                            fontSize="sm"
                          />
                        </VStack>
                      )}
                    </VStack>
                  )}
                </VStack>
              </Box>
            );
          })}
        </VStack>
      )}
    </VStack>
  );
}
