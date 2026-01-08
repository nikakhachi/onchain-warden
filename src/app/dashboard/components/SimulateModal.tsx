"use client";

import { Button } from "@/app/components/Button";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";

interface SimulateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulate: (blockNumber: string) => void;
  isSubmitting?: boolean;
}

export function SimulateModal({ isOpen, onClose, onSimulate, isSubmitting = false }: SimulateModalProps) {
  const [blockNumber, setBlockNumber] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!blockNumber.trim()) {
      setError("Block number is required");
      return;
    }

    // Validate block number is a positive integer
    const blockNum = parseInt(blockNumber.trim(), 10);
    if (isNaN(blockNum) || blockNum <= 0) {
      setError("Block number must be a positive integer");
      return;
    }

    setError(null);
    onSimulate(blockNumber.trim());
  };

  const handleClose = () => {
    setBlockNumber("");
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md">
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white">
        <ModalHeader>
          <Text fontSize="xl" fontWeight="bold" color="white">
            Simulate Alert
          </Text>
        </ModalHeader>
        <ModalCloseButton color="gray.400" />
        <ModalBody>
          <VStack alignItems="stretch" gap={4}>
            <Text color="gray.300" fontSize="sm">
              Provide the block number when this event with the provided conditions was triggered. You will receive a
              simulation test message so you can see how the message will look like.
            </Text>
            <FormControl isInvalid={!!error}>
              <FormLabel color="gray.300">Block Number</FormLabel>
              <Input
                value={blockNumber}
                onChange={(e) => {
                  setBlockNumber(e.target.value);
                  setError(null);
                }}
                placeholder="Enter block number..."
                backgroundColor="gray.800"
                borderColor={error ? "red.500" : "gray.700"}
                color="white"
                type="number"
                min="1"
              />
              {error && <FormErrorMessage>{error}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={handleClose} marginRight={3} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            Simulate
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
