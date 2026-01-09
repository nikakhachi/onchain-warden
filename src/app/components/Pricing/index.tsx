"use client";

import { useMemo, useState, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
} from "@chakra-ui/react";
import { motion, useInView } from "framer-motion";
import { ACCENT_COLORS, GRADIENTS, GRADIENT_COLORS } from "../../theme";
import { Button } from "../Button";
import { Card } from "../Card";
import { CheckIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { SwitchButton } from "../SwitchButton";
import { JoinWaitlistModal } from "../JoinWaitlistModal";

const MotionVStack = motion(VStack);
const MotionBox = motion(Box);

const plans = [
  {
    title: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyMonthlyPrice: 0,
    alerts: 3,
    features: [
      "Real-time Alerts",
      "Delivered to Telegram, Slack & Discord",
      "Ethereum & Base Chains",
      "Unlimited Channels",
      "Community Support on Discord",
    ],
    buttonText: "Get Started",
    buttonVariant: "secondary",
  },
  {
    title: "Solo",
    description: "For power users",
    monthlyPrice: 29,
    yearlyMonthlyPrice: 25,
    alerts: 20,
    extraAlerts: "+$5 for every extra 5 alerts",
    features: ["Real-time Alerts", "Everything in Free", "On-Demand EVM Chain Integrations", "Priority Support"],
    buttonText: "Join Waitlist",
    buttonVariant: "primary",
  },
  {
    title: "Team",
    description: "For teams & organizations",
    monthlyPrice: 89,
    yearlyMonthlyPrice: 79,
    alerts: 50,
    extraAlerts: "+$10 for every extra 10 alerts",
    features: ["Real-time Alerts", , "Unlimited Members", "On-Demand EVM Chain Integrations", "Hands-on Support"],
    buttonText: "Join Waitlist",
    buttonVariant: "primary",
  },
];

export const PricingPage = () => {
  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="pricing">
      <PricingContent page="landing" />
    </Box>
  );
};

export const PricingContent = ({ page }: { page: "landing" | "teams" | "alerts" | "dashboard-pricing" }) => {
  const [isYearly, setIsYearly] = useState(true);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <>
      <Container maxW="7xl" ref={ref}>
        <VStack gap={12}>
          <MotionVStack
            gap={6}
            textAlign="center"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
          >
            {page === "landing" && (
              <>
                <Heading
                  as="h2"
                  size="4xl"
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="700"
                  color="white"
                >
                  Choose Your{" "}
                  <Box as="span" background={GRADIENTS.primary} backgroundClip="text" color="transparent">
                    Plan
                  </Box>
                </Heading>

                <Text color="gray.400" fontSize="lg" maxW="2xl">
                  Start free and scale as you grow. No hidden fees.
                </Text>
              </>
            )}

            {page === "teams" && (
              <>
                {/* <Heading as="h2" fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} fontWeight="700" color="white">
                  Monitor as a Team
                </Heading> */}

                <Text color="gray.400" fontSize="lg" maxW="4xl">
                  Teams let your entire group share alerts, integrations, and stay synced on critical events.
                </Text>
              </>
            )}

            {page === "alerts" && (
              <>
                {/* <Heading as="h2" fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }} fontWeight="700" color="white">
                  You've Reached Your Alert Limit
                </Heading> */}

                <Text color="gray.400" fontSize="lg" maxW="4xl">
                  Free plans include 3 alerts. Upgrade to Premium to monitor more events and get priority support.
                </Text>
              </>
            )}

            {page === "dashboard-pricing" && (
              <>
                <Text color="gray.400" fontSize="lg" maxW="4xl">
                  Choose a plan to get started.
                </Text>
              </>
            )}

            <HStack
              display="flex"
              gap={2}
              padding={1.5}
              borderRadius="lg"
              backgroundColor="rgba(33, 33, 33, 0.2)"
              borderWidth="1px"
              borderColor="gray.800"
              width="fit-content"
            >
              <SwitchButton active={!isYearly} onClick={() => setIsYearly(false)} label="Monthly" />
              <SwitchButton
                active={isYearly}
                onClick={() => setIsYearly(true)}
                label={
                  <Text as="span">
                    Annualㅤ
                    <Text
                      as="span"
                      color={isYearly ? "cyan.200" : ACCENT_COLORS.cyan[400]}
                      fontSize="sm"
                      fontWeight="600"
                    >
                      Save up to 14%
                    </Text>
                  </Text>
                }
              />
            </HStack>
          </MotionVStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
            {plans.map((plan, index) => {
              const highlight =
                ((page === "alerts" || page === "dashboard-pricing") && plan.title === "Solo") ||
                (page === "teams" && plan.title === "Team");

              const CardWrapper = highlight ? Box : Card;
              const cardProps = highlight
                ? {
                    padding: 8,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column" as const,
                    borderRadius: "2xl",
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    borderWidth: "2px",
                    borderColor: GRADIENT_COLORS.blue,
                  }
                : {
                    hoverable: false,
                    padding: 8,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column" as const,
                  };

              const savings =
                isYearly && plan.monthlyPrice > 0 ? plan.monthlyPrice * 12 - plan.yearlyMonthlyPrice * 12 : 0;

              return (
                <MotionBox
                  key={index}
                  position="relative"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  {isYearly && plan.monthlyPrice > 0 && (
                    <Box
                      position="absolute"
                      top={4}
                      right={4}
                      zIndex={1}
                      paddingX={3}
                      paddingY={1}
                      borderRadius="md"
                      backgroundColor={ACCENT_COLORS.cyan.bg}
                      borderWidth="1px"
                      borderColor={ACCENT_COLORS.cyan[400]}
                    >
                      <Text color={ACCENT_COLORS.cyan[300]} fontSize="xs" fontWeight="600">
                        Save ${savings}/year
                      </Text>
                    </Box>
                  )}
                  <CardWrapper {...cardProps}>
                    <VStack gap={6} alignItems="flex-start" flex={1}>
                      <VStack gap={2} alignItems="flex-start" width="100%">
                        <Heading as="h3" size="lg" fontWeight="700" color="white">
                          {plan.title}
                        </Heading>
                        <Text color="gray.400" fontSize="sm">
                          {plan.description}
                        </Text>
                      </VStack>

                      <VStack gap={2} alignItems="flex-start" width="100%">
                        <VStack gap={0} alignItems="flex-start" width="100%">
                          <Text fontSize="3xl" fontWeight="700" color="white">
                            {`$${isYearly ? plan.yearlyMonthlyPrice : plan.monthlyPrice}`}
                            <Text as="span" color="gray.500" fontSize="xs">
                              /month
                            </Text>
                            {isYearly && plan.monthlyPrice > 0 && (
                              <Text as="span" color="gray.500" fontSize="xs">
                                , billed annually
                              </Text>
                            )}
                          </Text>
                        </VStack>

                        <Box
                          paddingX={4}
                          paddingY={2}
                          borderRadius="lg"
                          backgroundColor="gray.900"
                          borderWidth="1px"
                          borderColor="gray.700"
                          width="100%"
                        >
                          <Text color="white" fontSize="md" fontWeight="600">
                            {plan.alerts} alerts
                          </Text>
                        </Box>

                        {plan.monthlyPrice > 0 && (
                          <VStack gap={1} alignItems="flex-start" width="100%">
                            <Text color={GRADIENT_COLORS.blue} fontSize="sm" fontWeight="500">
                              {plan.extraAlerts}
                            </Text>
                          </VStack>
                        )}
                      </VStack>

                      <VStack gap={3} alignItems="flex-start" flex={1} width="100%">
                        {plan.features.map((feature, featureIndex) => (
                          <HStack key={featureIndex} gap={3} alignItems="flex-start">
                            <Box
                              flexShrink={0}
                              width="20px"
                              height="20px"
                              borderRadius="full"
                              backgroundColor="green.500"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              marginTop="2px"
                            >
                              <CheckIcon color="white" boxSize={3} />
                            </Box>
                            <Text color="gray.300" fontSize="sm" lineHeight="1.5">
                              {feature}
                            </Text>
                          </HStack>
                        ))}
                      </VStack>

                      <Box width="100%" marginTop="auto">
                        {plan.title === "Free" ? (
                          <>
                            <Link href="/dashboard/alerts" style={{ width: "100%", display: "block" }}>
                              <Button variant={plan.buttonVariant as "primary" | "secondary"} size="md" width="100%">
                                {plan.buttonText}
                              </Button>
                            </Link>
                            <Text
                              color="gray.400"
                              fontSize="sm"
                              textAlign="center"
                              mt={2}
                              position="absolute"
                              bottom={2}
                              left={0}
                              right={0}
                              textDecoration="underline"
                            >
                              No credit card required
                            </Text>
                          </>
                        ) : (
                          <Button
                            variant={plan.buttonVariant as "primary" | "secondary"}
                            size="md"
                            width="100%"
                            onClick={() => setIsWaitlistModalOpen(true)}
                          >
                            {plan.buttonText}
                          </Button>
                        )}
                      </Box>
                    </VStack>
                  </CardWrapper>
                </MotionBox>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Container>
      <JoinWaitlistModal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)} />
    </>
  );
};

export const PricingContentModal = ({
  isOpen,
  onClose,
  page,
}: {
  isOpen: boolean;
  onClose: () => void;
  page: "landing" | "teams" | "alerts";
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent backgroundColor="gray.900" maxW="1300px" px={6} py={10}>
        <ModalCloseButton color="white" />
        <PricingContent page={page} />
      </ModalContent>
    </Modal>
  );
};
