"use client";

import { useState } from "react";
import { Box, Container, Heading, Text, VStack, HStack, SimpleGrid } from "@chakra-ui/react";
import { ACCENT_COLORS, GRADIENTS, GRADIENT_COLORS } from "../../theme";
import { Button } from "../Button";
import { Card } from "../Card";
import { CheckIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { SwitchButton } from "../SwitchButton";
import { JoinWaitlistModal } from "../JoinWaitlistModal";

const plans = [
  {
    title: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    yearlyMonthlyPrice: 0,
    alerts: 5,
    features: [
      "Real-time notifications",
      "Telegram, Slack & Discord",
      "Unlimited channels",
      "Unlimited labeled addresses",
      "Community support on Discord",
    ],
    buttonText: "Get Started",
    buttonVariant: "secondary",
  },
  {
    title: "Solo",
    description: "For power users",
    monthlyPrice: 29,
    yearlyMonthlyPrice: 24,
    alerts: 30,
    extraAlerts: "+$5 for 6 more alerts",
    features: ["Everything in Free", "Priority support"],
    buttonText: "Join Waitlist",
    buttonVariant: "primary",
    highlight: true,
  },
  {
    title: "Team",
    description: "For teams & organizations",
    monthlyPrice: 79,
    yearlyMonthlyPrice: 73,
    alerts: 100,
    extraAlerts: "+$10 for 15 more alerts",
    features: ["Unlimited members", "Hands-on support"],
    buttonText: "Join Waitlist",
    buttonVariant: "primary",
  },
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(true);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  return (
    <Box as="section" paddingY={20} backgroundColor="gray.950" id="pricing">
      <Container maxW="7xl">
        <VStack gap={12}>
          <VStack gap={6} textAlign="center">
            <Box
              paddingX={4}
              paddingY={2}
              borderRadius="full"
              borderWidth="1px"
              borderColor={ACCENT_COLORS.cyan[400]}
              backgroundColor={ACCENT_COLORS.cyan.bg}
              display="inline-flex"
            >
              <Text fontSize="sm" color={ACCENT_COLORS.cyan[300]} fontWeight="medium">
                Pricing
              </Text>
            </Box>

            <Heading as="h2" size="4xl" fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }} fontWeight="700" color="white">
              Start Free,{" "}
              <Box as="span" background={GRADIENTS.primary} backgroundClip="text" color="transparent">
                Scale as You Grow
              </Box>
            </Heading>

            <Text color="gray.400" fontSize="lg" maxW="2xl">
              Start free and scale as you grow. No hidden fees.
            </Text>

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
                    Yearlyㅤ
                    <Text
                      as="span"
                      color={isYearly ? "cyan.200" : ACCENT_COLORS.cyan[400]}
                      fontSize="sm"
                      fontWeight="600"
                    >
                      Save 10%
                    </Text>
                  </Text>
                }
              />
            </HStack>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
            {plans.map((plan, index) => {
              const CardWrapper = plan.highlight ? Box : Card;
              const cardProps = plan.highlight
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

              return (
                <Box key={index} position="relative">
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
                        <Text fontSize="3xl" fontWeight="700" color="white">
                          {`$${isYearly ? plan.yearlyMonthlyPrice : plan.monthlyPrice} /month`}
                        </Text>

                        <Box
                          paddingX={4}
                          paddingY={2}
                          borderRadius="lg"
                          backgroundColor="gray.900"
                          borderWidth="1px"
                          borderColor="gray.700"
                          width="100%"
                        >
                          <Text color="white" fontSize="lg" fontWeight="600">
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
                          <Link href="/dashboard/alerts" style={{ width: "100%", display: "block" }}>
                            <Button variant={plan.buttonVariant as "primary" | "secondary"} size="md" width="100%">
                              {plan.buttonText}
                            </Button>
                          </Link>
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
                </Box>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Container>

      <JoinWaitlistModal
        isOpen={isWaitlistModalOpen}
        onClose={() => setIsWaitlistModalOpen(false)}
        successMessage="Successfully joined the waitlist! We'll notify you when premium plans launch."
        description="Enter your email to be notified when premium plans launch. We'll send you early access information."
      />
    </Box>
  );
}
