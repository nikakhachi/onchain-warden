"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import {
  CreateWatcherProvider,
  useCreateWatcher,
} from "./context/CreateWatcherContext";
import { ProgressStepper } from "./ProgressStepper";
import { Step1EventSource } from "./steps/Step1EventSource";
import { Step2Conditions } from "./steps/Step2Conditions";
import { Step3Message } from "./steps/Step3Message";
import { Step4Integrations } from "./steps/Step4Integrations";
import { Button } from "../Button";

function EventSubscriptionFormContent() {
  const {
    currentStep,
    handleNext,
    handleBack,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
    handleSubmit,
    isSubmitting,
    submitError,
  } = useCreateWatcher();

  return (
    <Box>
      <ProgressStepper currentStep={currentStep} />
      <Box
        marginTop={8}
        padding={8}
        borderRadius="2xl"
        backgroundColor="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
      >
        {currentStep === 1 && <Step1EventSource />}
        {currentStep === 2 && <Step2Conditions />}
        {currentStep === 3 && <Step3Message />}
        {currentStep === 4 && <Step4Integrations />}
        <HStack
          justifyContent="space-between"
          marginTop={8}
          paddingTop={6}
          borderTopWidth="1px"
          borderTopColor="gray.800"
        >
          <Button
            variant="secondary"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          {currentStep < 4 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedToStep2()) ||
                (currentStep === 2 && !canProceedToStep3()) ||
                (currentStep === 3 && !canProceedToStep4())
              }
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              loading={isSubmitting}
            >
              Create Watcher
            </Button>
          )}
        </HStack>

        {submitError && (
          <Text color="red.400" fontSize="sm" marginTop={4}>
            {submitError}
          </Text>
        )}
      </Box>
    </Box>
  );
}

export function EventSubscriptionForm() {
  return (
    <CreateWatcherProvider>
      <EventSubscriptionFormContent />
    </CreateWatcherProvider>
  );
}
