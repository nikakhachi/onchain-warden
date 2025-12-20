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

function getEventName(abi: string) {
  try {
    const parsed = parseAbiItem(abi) as any;
    if (parsed.type === "event" && parsed.name) {
      return parsed.name;
    }
  } catch (e) {
    // Fallback
  }
  const match = abi.match(/event\s+(\w+)\s*\(/);
  return match ? match[1] : "Unknown Event";
}

export function Step3Message() {
  const {
    watcherLabel,
    setWatcherLabel,
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
      {/* Watcher Label */}
      <VStack alignItems="flex-start" gap={2}>
        <Heading as="h3" size="md" color="white">
          Watcher Label
        </Heading>
        <Input
          value={watcherLabel}
          onChange={(e) => setWatcherLabel(e.target.value)}
          placeholder="e.g., USDT Whale Tracker"
          backgroundColor="gray.800"
          borderColor="gray.700"
          color="white"
          width="100%"
        />
        <Text color="gray.400" fontSize="sm">
          A friendly name to identify this watcher in notifications
        </Text>
      </VStack>

      {/* Message Fields */}
      <VStack alignItems="flex-start" gap={4}>
        <Heading as="h3" size="md" color="white">
          Message Fields
        </Heading>
        <Text color="gray.400" fontSize="sm">
          Select which fields to include in notifications
        </Text>
        <SimpleGrid columns={2} gap={3} width="100%">
          <CheckboxRoot
            checked={displayConfig.timestamp}
            onCheckedChange={(e) =>
              setDisplayConfig({
                ...displayConfig,
                timestamp: e.checked,
              })
            }
            colorPalette="cyan"
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
              setDisplayConfig({ ...displayConfig, label: e.checked })
            }
            colorPalette="cyan"
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
              setDisplayConfig({ ...displayConfig, chain: e.checked })
            }
            colorPalette="cyan"
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
                contract_address: e.checked,
              })
            }
            colorPalette="cyan"
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
                event_abi: e.checked,
              })
            }
            colorPalette="cyan"
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
                explorer_link: e.checked,
              })
            }
            colorPalette="cyan"
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
                layerzer_link: e.checked,
              })
            }
            colorPalette="cyan"
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
                      colorPalette="cyan"
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

      {/* Message Preview */}
      <VStack alignItems="flex-start" gap={3}>
        <Heading as="h3" size="md" color="white">
          Message Preview
        </Heading>
        <Box
          padding={4}
          borderRadius="lg"
          backgroundColor="gray.800"
          borderWidth="1px"
          borderColor="gray.700"
          width="100%"
        >
          <VStack alignItems="flex-start" gap={2}>
            {displayConfig.timestamp && (
              <Text color="gray.300" fontSize="sm" fontFamily="mono">
                Timestamp: 2024-01-15 14:32:45 UTC
              </Text>
            )}
            {displayConfig.chain && (
              <Text color="gray.300" fontSize="sm" fontFamily="mono">
                Chain: {selectedChain?.name || "Ethereum"}
              </Text>
            )}
            {displayConfig.contract_address && (
              <Text color="gray.300" fontSize="sm" fontFamily="mono">
                Contract: {contractAddress.slice(0, 6)}...
                {contractAddress.slice(-4)}
              </Text>
            )}
            {displayConfig.event_abi && (
              <Text color="gray.300" fontSize="sm" fontFamily="mono">
                Event: {getEventName(eventAbi)}
              </Text>
            )}
            {displayConfig.args.map(
              (
                arg: { key: string; label?: string; decimals?: number },
                idx: number
              ) => (
                <Text
                  key={arg.key || `arg-${idx}`}
                  color="gray.300"
                  fontSize="sm"
                  fontFamily="mono"
                >
                  {arg.label || arg.key}: 0x1234...5678
                </Text>
              )
            )}
          </VStack>
          {displayConfig.explorer_link && (
            <Text
              color="cyan.400"
              fontSize="sm"
              marginTop={2}
              cursor="pointer"
              _hover={{ textDecoration: "underline" }}
            >
              View on Explorer →
            </Text>
          )}
        </Box>
      </VStack>
    </VStack>
  );
}
