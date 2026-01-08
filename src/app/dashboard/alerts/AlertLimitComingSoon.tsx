import { GRADIENT_COLORS, GRADIENTS } from "@/app/theme";
import {
  Box,
  VStack,
  Badge,
  HStack,
  Text,
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
} from "@chakra-ui/react";
import { Button } from "@/app/components/Button";
import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useToast } from "@/app/providers/ToastContext";
import { useRouter } from "next/navigation";

export const AlertLimitComingSoon = () => {
  const router = useRouter();

  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
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
      setIsWaitlistModalOpen(false);
    } catch (error: any) {
      showError(error.message || "Failed to join waitlist. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseWaitlistModal = () => {
    setEmail("");
    setEmailError("");
    setIsWaitlistModalOpen(false);
  };

  return (
    <>
      <Box>
        <VStack alignItems="center" justifyContent="center" paddingY={12} gap={8}>
          <VStack gap={4}>
            <Badge borderRadius="full" px={4} py={1.5}>
              <Text fontSize="md">🌟 Premium Feature</Text>
            </Badge>
            <VStack gap={2} alignItems="center">
              <Text color="white" fontSize="2xl" fontWeight="600" textAlign="center">
                You've Reached Your Alert Limit
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center" maxW="500px">
                Free plans include 5 alerts. Upgrade to Pro to monitor more events and get priority support.
              </Text>
            </VStack>
          </VStack>

          <VStack gap={3} alignItems="stretch" width="100%" maxW="500px">
            <Box padding={4} borderRadius="xl" borderWidth="1px" borderColor="gray.700">
              <HStack gap={4} alignItems="flex-start">
                <Box
                  width="40px"
                  height="40px"
                  borderRadius="lg"
                  background={GRADIENTS.primaryDiagonal}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Text fontSize="xl" color={GRADIENT_COLORS.purple}>
                    🔔
                  </Text>
                </Box>
                <VStack alignItems="flex-start" gap={1} flex={1}>
                  <Text color="white" fontWeight="600" fontSize="sm">
                    25 Alerts
                  </Text>
                  <Text color="gray.400" fontSize="xs">
                    Monitor more events - additional alerts available on demand
                  </Text>
                </VStack>
              </HStack>
            </Box>

            <Box padding={4} borderRadius="xl" borderWidth="1px" borderColor="gray.700">
              <HStack gap={4} alignItems="flex-start">
                <Box
                  width="40px"
                  height="40px"
                  borderRadius="lg"
                  background={GRADIENTS.primary}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                >
                  <Text fontSize="xl" color={GRADIENT_COLORS.purple}>
                    🧑‍💻
                  </Text>
                </Box>
                <VStack alignItems="flex-start" gap={1} flex={1}>
                  <Text color="white" fontWeight="600" fontSize="sm">
                    Hands-On Support
                  </Text>
                  <Text color="gray.400" fontSize="xs">
                    Direct help to set up and optimize your alerts
                  </Text>
                </VStack>
              </HStack>
            </Box>
          </VStack>

          <Box py={1} width="100%" maxW="500px">
            <VStack gap={2} alignItems="flex-start">
              <Text color="white" fontWeight="600" fontSize="sm">
                Monitoring as a Team?
              </Text>
              <Text color="gray.400" fontSize="sm">
                Teams include even more alerts and unlimited members
              </Text>
              <Text
                onClick={() => router.push("/dashboard/teams")}
                color={GRADIENT_COLORS.blue}
                fontSize="sm"
                fontWeight="600"
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
              >
                Learn More →
              </Text>
            </VStack>
          </Box>

          <VStack gap={4}>
            <Button variant="primary" size="md" onClick={() => setIsWaitlistModalOpen(true)}>
              Join Waitlist
            </Button>
            <Text color="gray.500" fontSize="xs" textAlign="center">
              Be the first to know when premium features launch
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Waitlist Modal - Internal to AlertLimitComingSoon */}
      <Modal isOpen={isWaitlistModalOpen} onClose={handleCloseWaitlistModal}>
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
              <Button variant="secondary" size="sm" onClick={handleCloseWaitlistModal} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const ModalAlertLimitComingSoon = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor="gray.900" maxW="600px">
        <ModalCloseButton color="white" />
        <AlertLimitComingSoon />
      </ModalContent>
    </Modal>
  );
};
