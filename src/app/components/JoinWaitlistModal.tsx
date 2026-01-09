"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  ModalBody,
  ModalFooter,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import { Button } from "./Button";
import { useAction } from "convex/react";
import { useToast } from "@/app/providers/ToastContext";
import { api } from "../../../convex/_generated/api";

interface JoinWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinWaitlistModal({ isOpen, onClose }: JoinWaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const joinWaitlist = useAction(api.waitlist.joinWaitlist);
  const { success: showSuccess, error: showError } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);
    try {
      await joinWaitlist({ email: email.trim() });
      showSuccess("Successfully joined the waitlist! We'll notify you when premium features launch.");
      setEmail("");
      setEmailError("");
      onClose();
    } catch (error: any) {
      showError(error.message || "Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail("");
    setEmailError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent backgroundColor="gray.900" maxW="500px">
        <ModalCloseButton color="white" />
        <ModalHeader color="white">Join Waitlist</ModalHeader>
        <ModalBody>
          <VStack gap={4} alignItems="stretch">
            <Text color="gray.400" fontSize="sm">
              Enter your email to be notified when premium features launch. We'll send you early access information.
            </Text>
            <FormControl isInvalid={!!emailError}>
              <FormLabel color="gray.300">Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="your.email@example.com"
                borderColor={emailError ? "red.500" : "gray.800"}
                backgroundColor="gray.950"
                color="white"
                _focus={{
                  borderColor: emailError ? "red.500" : "blue.500",
                  boxShadow: emailError
                    ? "0 0 0 1px var(--chakra-colors-red-500)"
                    : "0 0 0 1px var(--chakra-colors-blue-500)",
                }}
              />
              {emailError && <FormErrorMessage>{emailError}</FormErrorMessage>}
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack gap={3}>
            <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
