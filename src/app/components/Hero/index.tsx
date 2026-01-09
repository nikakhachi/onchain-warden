"use client";

import { Box, Container, Heading, Text, VStack, HStack, SimpleGrid } from "@chakra-ui/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "../Button";
import { GRADIENTS, ACCENT_COLORS } from "../../theme";
import { IntegrationIcon } from "../../icons/IntegrationIcon";
import { ProtocolIcon } from "../../icons/ProtocolIcon";

const MotionBox = motion(Box);
const MotionText = motion(Text);
const MotionVStack = motion(VStack);

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const IconBox = ({ icon }: { icon: React.ReactNode }) => {
  return (
    <Box width="20px" height="20px" borderRadius="full" overflow="hidden" flexShrink={0}>
      {icon}
    </Box>
  );
};

export function Hero() {
  return (
    <Box as="section" paddingY={20} backgroundColor="transparent" position="relative" alignItems="center">
      <Container maxW="7xl" position="relative" zIndex={1}>
        <MotionVStack
          gap={12}
          alignItems="center"
          textAlign="center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <MotionBox
            variants={itemVariants}
            paddingX={4}
            paddingY={2}
            borderRadius="full"
            borderWidth="1px"
            borderColor={ACCENT_COLORS.cyan[400]}
            backgroundColor={ACCENT_COLORS.cyan.bg}
            display="flex"
            alignItems="center"
            gap={2}
            animate={{
              boxShadow: [
                `0 0 20px ${ACCENT_COLORS.cyan[400]}30`,
                `0 0 40px ${ACCENT_COLORS.cyan[400]}50`,
                `0 0 20px ${ACCENT_COLORS.cyan[400]}30`,
              ],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Text fontSize="lg">⚡</Text>
            <Text fontSize="sm" color={ACCENT_COLORS.cyan[300]} fontWeight="medium">
              Real-time DeFi Monitoring
            </Text>
          </MotionBox>

          <MotionVStack variants={itemVariants} gap={6}>
            {/* Main Heading */}
            <Heading
              as="h1"
              size="4xl"
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl", xl: "6xl" }}
              fontWeight="700"
              color="white"
              lineHeight="1.1"
            >
              Your Custom{" "}
              <Box
                as="span"
                background={GRADIENTS.primary}
                backgroundClip="text"
                color="transparent"
                display="inline-block"
              >
                On-Chain Alert
              </Box>{" "}
              System
            </Heading>

            <MotionText variants={itemVariants} fontSize="xl" color="gray.400" maxW="3xl" lineHeight="1.6">
              Monitor any event across EVM chains. Define conditions, customize notifications, and get instant alerts.
              Get started{" "}
              <Text as="span" fontWeight="bold" color="white">
                for Free.
              </Text>
            </MotionText>

            {/* CTA Buttons */}
            <MotionBox variants={itemVariants} position="relative">
              <HStack gap={4} marginTop={4} alignItems="center">
                <Box position="relative">
                  <Link href="/dashboard/alerts">
                    <Button variant="primary" size="lg" position="relative">
                      Create Your First Alert →
                    </Button>
                  </Link>
                  <Text
                    textDecoration="underline"
                    color="gray.400"
                    fontSize="sm"
                    position="absolute"
                    top="100%"
                    left="50%"
                    transform="translateX(-50%)"
                    marginTop={2}
                    whiteSpace="nowrap"
                  >
                    No Credit Card Required
                  </Text>
                </Box>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    const element = document.querySelector("#how-it-works");
                    if (element) {
                      const offset = 80;
                      const elementPosition = element.getBoundingClientRect().top;
                      const offsetPosition = elementPosition + window.pageYOffset - offset;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  Learn More
                </Button>
              </HStack>
            </MotionBox>
          </MotionVStack>

          {/* Stats Grid */}
          <MotionBox variants={itemVariants} width="100%">
            <SimpleGrid columns={{ base: 1, md: 3 }} width="100%" marginTop={16} maxW="2xl" mx="auto">
              {/* Protocols */}
              <MotionBox
                as={VStack}
                gap={1}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  background={GRADIENTS.primary}
                  backgroundClip="text"
                  color="transparent"
                >
                  20+
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Protocols Tracked, including
                </Text>
                <HStack gap={1} justifyContent="center" flexWrap="wrap">
                  {["Morpho", "Pendle", "Euler", "Reservoir", "LayerZero", "Aave", "Uniswap"].map((item, index) => (
                    <MotionBox
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                    >
                      <IconBox icon={<ProtocolIcon name={item} />} />
                    </MotionBox>
                  ))}
                </HStack>
              </MotionBox>

              {/* No-Code */}
              <MotionBox
                as={VStack}
                gap={1}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  background={GRADIENTS.primary}
                  backgroundClip="text"
                  color="transparent"
                  textAlign="center"
                >
                  No-Code Setup
                </Text>
                <Text color="gray.400" fontSize="sm" textAlign="center">
                  Create alerts in minutes, no coding required
                </Text>
                <HStack mt={1} gap={1.5} justifyContent="center" flexWrap="wrap">
                  {["Simple", "Fast", "Reliable"].map((item, index) => (
                    <MotionBox
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      paddingX={2}
                      paddingY={1}
                      borderRadius="md"
                      backgroundColor="rgba(59, 130, 246, 0.1)"
                      borderWidth="1px"
                      borderColor="rgba(59, 130, 246, 0.2)"
                    >
                      <Text color="blue.400" fontSize="xs" fontWeight="medium">
                        {item}
                      </Text>
                    </MotionBox>
                  ))}
                </HStack>
              </MotionBox>

              {/* Platforms */}
              <MotionBox
                as={VStack}
                gap={1}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Text
                  fontSize="3xl"
                  fontWeight="bold"
                  background={GRADIENTS.primary}
                  backgroundClip="text"
                  color="transparent"
                >
                  3
                </Text>
                <Text color="gray.400" fontSize="sm">
                  Cross-Platform Alerts
                </Text>
                <HStack mt={1} gap={1} justifyContent="center" flexWrap="wrap">
                  {["Telegram", "Slack", "Discord"].map((item, index) => (
                    <MotionBox
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <IconBox icon={<IntegrationIcon name={item} />} />
                    </MotionBox>
                  ))}
                </HStack>
              </MotionBox>
            </SimpleGrid>
          </MotionBox>
        </MotionVStack>
      </Container>
    </Box>
  );
}
