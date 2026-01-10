"use client";

import { Box, Card, Container, Heading, HStack, Link, SimpleGrid, VStack, Text } from "@chakra-ui/react";
import { LoadingScreen } from "../components/LoadingScreen";
import { useAuth } from "@/app/providers/AuthContext";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { SwitchButton } from "@/app/components/SwitchButton";
import { plans } from "@/app/shared/plans";
import { ACCENT_COLORS, GRADIENT_COLORS } from "@/app/theme";
import { IoMdCheckmark } from "react-icons/io";
import { CheckoutButton } from "../components/CheckoutButton";
import { DashboardPageHeader } from "../components/DashboardPageHeader";
import { Button } from "@/app/components/Button";

function PricingPageContent() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");

  const [isYearly, setIsYearly] = useState(false);

  if (!currentUser) return <LoadingScreen />;

  return (
    <Box flex={1} paddingY={8}>
      <Container maxW="8xl">
        <DashboardPageHeader
          title="Choose Your Plan"
          description={
            highlight === "solo"
              ? "You've used all 5 free alerts. Upgrade to Solo for more alerts."
              : highlight === "team"
                ? "Upgrade to Team to invite members and monitor events together."
                : "Start free and scale as you grow. No hidden fees."
          }
          marginBottom={6}
        />
        <HStack
          display="flex"
          gap={2}
          padding={1.5}
          borderRadius="lg"
          backgroundColor="rgba(33, 33, 33, 0.2)"
          borderWidth="1px"
          borderColor="gray.800"
          width="fit-content"
          mb={6}
        >
          <SwitchButton active={!isYearly} onClick={() => setIsYearly(false)} label="Monthly" />
          <SwitchButton
            active={isYearly}
            onClick={() => setIsYearly(true)}
            label={
              <Text as="span">
                Annualㅤ
                <Text as="span" color={isYearly ? "cyan.200" : ACCENT_COLORS.cyan[400]} fontSize="sm" fontWeight="600">
                  Save 17%
                </Text>
              </Text>
            }
          />
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8} width="100%">
          {plans.map((plan, index) => {
            const isHighlighted =
              highlight === "team"
                ? plan.title === "Team"
                : highlight === "solo"
                  ? plan.title === "Solo"
                  : plan.title === "Solo";

            const CardWrapper = isHighlighted ? Box : Card;
            const cardProps = isHighlighted
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
                  borderWidth: "1px",
                  borderColor: "gray.800",
                  backgroundColor: "#080D14",
                  borderRadius: "2xl",
                };

            const savings = isYearly && plan.monthlyPrice > 0 ? plan.monthlyPrice * 12 - plan.annualPrice : 0;

            return (
              <Box key={index} position="relative">
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
                          {`$${isYearly ? plan.annualPrice : plan.monthlyPrice}`}
                          <Text as="span" color="gray.500" fontSize="xs">
                            {isYearly ? "/year" : "/month"}
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
                            backgroundColor="green"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            marginTop="2px"
                          >
                            <IoMdCheckmark color="white" />
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
                        <CheckoutButton plan={plan} isYearly={isYearly} />
                      )}
                    </Box>
                  </VStack>
                </CardWrapper>
              </Box>
            );
          })}
        </SimpleGrid>
      </Container>
    </Box>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PricingPageContent />
    </Suspense>
  );
}
