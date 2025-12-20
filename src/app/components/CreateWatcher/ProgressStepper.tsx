"use client";

import { HStack, VStack, Box, Text } from "@chakra-ui/react";

type Step = 1 | 2 | 3 | 4;

interface ProgressStepperProps {
  currentStep: Step;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const steps = [
    {
      number: 1,
      title: "Event Source",
      description: "Select chain, contract & event",
    },
    { number: 2, title: "Conditions", description: "Add filter conditions" },
    { number: 3, title: "Message", description: "Configure notification" },
    { number: 4, title: "Integrations", description: "Choose destinations" },
  ];

  return (
    <HStack
      gap={0}
      justifyContent="space-between"
      marginBottom={8}
      width="100%"
    >
      {steps.map((step, index) => {
        const isActive = currentStep === step.number;
        const isCompleted = currentStep > step.number;
        const isLast = index === steps.length - 1;

        return (
          <HStack key={step.number} gap={0} flex={1} alignItems="center">
            <VStack gap={2} alignItems="center" flex={0}>
              <Box
                width="36px"
                height="36px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                backgroundColor={
                  isCompleted ? "cyan.500" : isActive ? "cyan.500" : "gray.700"
                }
                color="white"
                fontWeight="600"
                fontSize="sm"
                borderWidth={isActive ? "2px" : "0"}
                borderColor={isActive ? "cyan.300" : "transparent"}
              >
                {isCompleted ? "✓" : step.number}
              </Box>
              <VStack alignItems="center" gap={0} flex={0}>
                <Text
                  color={isActive || isCompleted ? "white" : "gray.400"}
                  fontWeight={isActive ? "600" : "normal"}
                  fontSize="sm"
                  textAlign="center"
                >
                  {step.title}
                </Text>
                <Text color="gray.500" fontSize="xs" textAlign="center">
                  {step.description}
                </Text>
              </VStack>
            </VStack>
            {!isLast && (
              <Box
                flex={1}
                height="2px"
                backgroundColor={isCompleted ? "cyan.500" : "gray.700"}
                marginX={4}
                minWidth="40px"
              />
            )}
          </HStack>
        );
      })}
    </HStack>
  );
}
