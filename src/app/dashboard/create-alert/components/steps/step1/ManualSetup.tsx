import { ChainIcon } from "@/app/icons/ChainIcon";
import {
  HStack,
  VStack,
  Text,
  RadioGroup,
  SimpleGrid,
  Box,
  Radio,
  Select,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { useEffect, useMemo, useState } from "react";
import { isAddress } from "viem";
import { useToast } from "@/app/providers/ToastContext";
import { fetchContractEvents } from "@/app/shared/helpers";
import { CHAINS_LIST } from "../../../../../../../convex/data/chains";

export const ManualSetup = () => {
  const {
    chainId,
    setChainId,
    contractAddress,
    handleAddressChange,
    eventAbi,
    availableEvents,
    selectedEventIndex,
    handleEventSelect,
    setAvailableEvents,
  } = useCreateWatcher();

  const { error: showError } = useToast();
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);

  const isAddressInvalid = useMemo(() => {
    return contractAddress.trim() !== "" && !isAddress(contractAddress);
  }, [contractAddress]);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!isAddress(contractAddress) || !chainId) return;

      setIsFetchingEvents(true);

      try {
        const events = await fetchContractEvents({
          contractAddress,
          chainId: Number(chainId),
        });
        setAvailableEvents(events);
      } catch (error) {
        showError("Failed to fetch events abi");
        setAvailableEvents([]);
      } finally {
        setIsFetchingEvents(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [contractAddress, chainId, chainId, showError]);

  return (
    <VStack alignItems="stretch" gap={4}>
      <HStack alignItems="flex-start" gap={4} width="100%">
        <FormControl isRequired flex={1}>
          <FormLabel color="gray.300">Chain</FormLabel>
          <RadioGroup value={chainId} onChange={(value) => setChainId(value)} width="100%">
            <SimpleGrid columns={2} gap={1.5} width="100%">
              {CHAINS_LIST.map((chain) => {
                const isSelected = chainId === String(chain.id);
                return (
                  <Box
                    key={chain.id}
                    as="label"
                    padding={2.5}
                    paddingX={3}
                    borderRadius="lg"
                    backgroundColor="gray.800"
                    borderWidth="1.5px"
                    borderColor={isSelected ? "blue.500" : "gray.700"}
                    cursor="pointer"
                    transition="all 0.2s"
                    _hover={{
                      borderColor: isSelected ? "blue.500" : "gray.600",
                      backgroundColor: isSelected ? "gray.800" : "gray.700",
                    }}
                    width="100%"
                  >
                    <HStack gap={2.5}>
                      <Radio value={String(chain.id)} colorScheme="blue" size="sm" />
                      <Box
                        width="24px"
                        height="24px"
                        borderRadius="full"
                        overflow="hidden"
                        flexShrink={0}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <ChainIcon name={chain.name} />
                      </Box>
                      <Text color="white" fontWeight="500" fontSize="xs">
                        {chain.name}
                      </Text>
                    </HStack>
                  </Box>
                );
              })}
            </SimpleGrid>
          </RadioGroup>
        </FormControl>

        <FormControl isRequired isInvalid={isAddressInvalid} flex={1}>
          <FormLabel color="gray.300">Contract Address</FormLabel>
          <HStack width="100%" gap={2}>
            <Input
              value={contractAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0x..."
              backgroundColor="gray.800"
              borderColor={isAddressInvalid ? "red.500" : "gray.700"}
              color="white"
              fontFamily="mono"
              flex={1}
            />
          </HStack>
          {isFetchingEvents && (
            <HStack gap={2} color="yellow.400" fontSize="sm" marginTop={1}>
              <Text>⏳</Text>
              <Text>Fetching ABI...</Text>
            </HStack>
          )}
          {isAddressInvalid && (
            <Text color="red.400" fontSize="sm" marginTop={1}>
              Invalid EVM address format
            </Text>
          )}

          {availableEvents.length > 0 && (
            <FormControl isRequired marginTop={4}>
              <FormLabel color="gray.300">Event</FormLabel>
              <Select
                value={selectedEventIndex}
                onChange={(e) => handleEventSelect(e.target.value)}
                backgroundColor="gray.800"
                borderColor="gray.700"
                color="white"
                placeholder="Select an event"
              >
                {availableEvents.map((event: any, index: number) => (
                  <option key={index} value={index.toString()}>
                    {event.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}

          {eventAbi && (
            <VStack alignItems="flex-start" gap={2} width="100%" marginTop={4}>
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                Event ABI
              </Text>
              <Box
                paddingX={3}
                paddingY={2}
                borderRadius="md"
                backgroundColor="gray.800"
                borderWidth="1px"
                borderColor="gray.700"
                width="100%"
                minHeight="40px"
                display="flex"
                alignItems="center"
              >
                <Text color="blue.400" fontSize="sm" fontFamily="mono" wordBreak="break-all">
                  {eventAbi}
                </Text>
              </Box>
            </VStack>
          )}
        </FormControl>
      </HStack>
    </VStack>
  );
};
