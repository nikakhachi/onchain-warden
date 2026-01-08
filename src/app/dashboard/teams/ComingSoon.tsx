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
} from "@chakra-ui/react";
import { Button } from "@/app/components/Button";

export const ComingSoon = () => {
  return (
    <Box>
      <VStack alignItems="center" justifyContent="center" paddingY={12} gap={8}>
        <Badge borderRadius="full" px={4} py={1.5}>
          <Text fontSize="md">🌟 Premium Feature</Text>
        </Badge>
        <VStack gap={2} alignItems="center">
          <Text color="white" fontSize="xl" fontWeight="600" textAlign="center">
            Supercharge Your Team Collaboration
          </Text>
          <Text color="gray.400" fontSize="sm" textAlign="center" maxW="500px">
            Teams let you organize alerts and integrations together. Join the waitlist to get early access.
          </Text>
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
                  High Alert Limits
                </Text>
                <Text color="gray.400" fontSize="xs">
                  Monitor more events with increased alert quotas
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
                  👥
                </Text>
              </Box>
              <VStack alignItems="flex-start" gap={1} flex={1}>
                <Text color="white" fontWeight="600" fontSize="sm">
                  Unlimited Team Members
                </Text>
                <Text color="gray.400" fontSize="xs">
                  Invite your entire team with no seat limits
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
                  Dedicated Support
                </Text>
                <Text color="gray.400" fontSize="xs">
                  Get priority assistance from our team
                </Text>
              </VStack>
            </HStack>
          </Box>
        </VStack>

        <VStack gap={4}>
          <Button variant="primary" size="md">
            Join Waitlist
          </Button>
          <Text color="gray.500" fontSize="xs" textAlign="center">
            Be the first to know when Teams launches
          </Text>
        </VStack>
      </VStack>
    </Box>
  );
};

export const ModalComingSoon = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor="gray.900" maxW="600px">
        <ModalCloseButton color="white" />
        <ComingSoon />
      </ModalContent>
    </Modal>
  );
};
