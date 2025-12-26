"use client";

import { GRADIENTS } from "@/app/theme";
import { HStack, VStack, Box, Text } from "@chakra-ui/react";

type Step = 1 | 2 | 3 | 4;

interface ProgressStepperProps {
  currentStep: Step;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const activeColor = GRADIENTS.primary;

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
    <Box width="100%" position="relative">
      <HStack width="100%" gap={0} alignItems="flex-start">
        {steps.map((step, index) => {
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isLast = index === steps.length - 1;

          return (
            <Box
              key={step.number}
              flex={1}
              position="relative"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              {/* Step Circle */}
              <Box
                width="36px"
                height="36px"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                background={isCompleted ? activeColor : isActive ? activeColor : "gray.700"}
                color="white"
                fontWeight="600"
                fontSize="sm"
                position="relative"
                zIndex={2}
              >
                {isCompleted ? "✓" : step.number}
              </Box>

              {/* Step Text */}
              <VStack gap={0.5} alignItems="center" marginTop={2} width="100%">
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

              {/* Connecting Line */}
              {!isLast && (
                <Box
                  position="absolute"
                  left="50%"
                  top="18px"
                  width="100%"
                  height="2px"
                  background={isCompleted ? activeColor : "gray.700"}
                  zIndex={1}
                />
              )}
            </Box>
          );
        })}
      </HStack>
    </Box>
  );
}
