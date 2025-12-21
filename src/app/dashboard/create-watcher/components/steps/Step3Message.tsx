"use client";

import {
  Box,
  Input,
  Heading,
  Text,
  HStack,
  VStack,
  CheckboxRoot,
  CheckboxControl,
  CheckboxIndicator,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { parseAbiItem } from "viem";
import { useCreateWatcher } from "../context/CreateWatcherContext";

export function Step3Message() {
  const {
    displayConfig,
    setDisplayConfig,
    eventArgs,
    selectedChain,
    contractAddress,
    eventAbi,
  } = useCreateWatcher();

  const updateArgConfig = (
    index: number,
    field: "label" | "decimals",
    value: string | number
  ) => {
    const updated = [...displayConfig.args];
    updated[index] = { ...updated[index], [field]: value };
    setDisplayConfig({ ...displayConfig, args: updated });
  };

  return (
    <VStack alignItems="stretch" gap={6}>
      {/* Message Fields */}
      <VStack alignItems="flex-start" gap={4}>
        <Heading as="h3" size="md" color="white">
          Message Fields
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Select which fields to include in notifications
        </Text>
        <SimpleGrid columns={4} gap={3} width="100%">
          <CheckboxRoot
            checked={displayConfig.timestamp}
            onCheckedChange={(e) =>
              setDisplayConfig({
                ...displayConfig,
                timestamp: Boolean(e.checked),
              })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              Timestamp
            </Text>
          </CheckboxRoot>
          <CheckboxRoot
            checked={displayConfig.label}
            onCheckedChange={(e) =>
              setDisplayConfig({ ...displayConfig, label: Boolean(e.checked) })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              Watcher Label
            </Text>
          </CheckboxRoot>
          <CheckboxRoot
            checked={displayConfig.chain}
            onCheckedChange={(e) =>
              setDisplayConfig({ ...displayConfig, chain: Boolean(e.checked) })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              Chain Name
            </Text>
          </CheckboxRoot>
          <CheckboxRoot
            checked={displayConfig.contract_address}
            onCheckedChange={(e) =>
              setDisplayConfig({
                ...displayConfig,
                contract_address: Boolean(e.checked),
              })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              Contract Address
            </Text>
          </CheckboxRoot>
          <CheckboxRoot
            checked={displayConfig.event_abi}
            onCheckedChange={(e) =>
              setDisplayConfig({
                ...displayConfig,
                event_abi: Boolean(e.checked),
              })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              Event ABI
            </Text>
          </CheckboxRoot>
          <CheckboxRoot
            checked={displayConfig.explorer_link}
            onCheckedChange={(e) =>
              setDisplayConfig({
                ...displayConfig,
                explorer_link: Boolean(e.checked),
              })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              Explorer Link
            </Text>
          </CheckboxRoot>
          <CheckboxRoot
            checked={displayConfig.layerzer_link}
            onCheckedChange={(e) =>
              setDisplayConfig({
                ...displayConfig,
                layerzer_link: Boolean(e.checked),
              })
            }
            colorPalette="blue"
          >
            <CheckboxControl>
              <CheckboxIndicator />
            </CheckboxControl>
            <Text color="white" fontSize="sm" marginLeft={2}>
              LayerZero Link
            </Text>
          </CheckboxRoot>
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
                    <CheckboxRoot
                      checked={isChecked}
                      onCheckedChange={(e) => {
                        if (e.checked) {
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
                      colorPalette="blue"
                    >
                      <CheckboxControl>
                        <CheckboxIndicator />
                      </CheckboxControl>
                      <Text
                        color="white"
                        fontSize="sm"
                        fontWeight="500"
                        marginLeft={2}
                      >
                        {arg.name || arg.internalType || `arg${index}`}
                      </Text>
                    </CheckboxRoot>
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
