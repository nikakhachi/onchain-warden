import { Button } from "@/app/components/Button";
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
} from "@chakra-ui/react";
import { useCreateWatcher } from "../../context/CreateWatcherContext";
import { Id } from "../../../../../../../convex/_generated/dataModel";

export const ManualSetup = () => {
  const {
    chainId,
    setChainId,
    contractAddress,
    handleAddressChange,
    eventAbi,
    availableEvents,
    isFetchingEvents,
    eventsFetchError,
    selectedEventIndex,
    handleEventSelect,
    abiFetched,
    handleFetchAbi,
    addressError,
    chains,
  } = useCreateWatcher();

  return (
    <VStack alignItems="stretch" gap={4}>
      <HStack alignItems="flex-start" gap={4} width="100%">
        <VStack alignItems="flex-start" gap={2} flex={1}>
          <Text color="gray.300" fontSize="sm" fontWeight="500">
            Chain
          </Text>
          <RadioGroup
            value={chainId}
            onChange={(value) => setChainId(value as Id<"chains">)}
            width="100%"
          >
            <SimpleGrid columns={3} gap={1.5} width="100%">
              {chains?.map((chain: any) => {
                const isSelected = chainId === chain._id;
                return (
                  <Box
                    key={chain._id}
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
                      <Radio value={chain._id} colorScheme="blue" size="sm" />
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
        </VStack>

        <VStack alignItems="flex-start" gap={2} flex={1}>
          <Text color="gray.300" fontSize="sm" fontWeight="500">
            Contract Address
          </Text>
          <HStack width="100%" gap={2}>
            <Input
              value={contractAddress}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0x..."
              backgroundColor="gray.800"
              borderColor={addressError ? "red.500" : "gray.700"}
              color="white"
              fontFamily="mono"
              flex={1}
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleFetchAbi}
              isLoading={isFetchingEvents}
            >
              Fetch ABI
            </Button>
          </HStack>
          {abiFetched && (
            <HStack gap={2} color="green.400" fontSize="sm">
              <Text>✓</Text>
              <Text>ABI fetched successfully</Text>
            </HStack>
          )}
          {addressError && (
            <Text color="red.400" fontSize="sm">
              {addressError}
            </Text>
          )}
          {eventsFetchError && (
            <Text color="red.400" fontSize="sm">
              {eventsFetchError}
            </Text>
          )}

          {availableEvents.length > 0 && (
            <VStack alignItems="flex-start" gap={2} width="100%">
              <Text color="gray.300" fontSize="sm" fontWeight="500">
                Event
              </Text>
              <Select
                value={selectedEventIndex}
                onChange={(e) => handleEventSelect(e.target.value)}
                backgroundColor="gray.800"
                borderColor="gray.700"
                color="white"
                placeholder="Select an event"
                width="100%"
              >
                {availableEvents.map((event: any, index: number) => (
                  <option key={index} value={index.toString()}>
                    {event.name}
                  </option>
                ))}
              </Select>
            </VStack>
          )}

          {eventAbi && (
            <VStack alignItems="flex-start" gap={2} width="100%">
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
                <Text
                  color="blue.400"
                  fontSize="sm"
                  fontFamily="mono"
                  wordBreak="break-all"
                >
                  {eventAbi}
                </Text>
              </Box>
            </VStack>
          )}
        </VStack>
      </HStack>
    </VStack>
  );
};
