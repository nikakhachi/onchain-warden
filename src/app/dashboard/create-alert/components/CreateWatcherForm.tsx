"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { useCreateWatcher } from "./context/CreateWatcherContext";
import { Step1EventSource } from "./steps/step1";
import { Step2Conditions } from "./steps/Step2Conditions";
import { Step3Message } from "./steps/Step3Message";
import { Step4Integrations } from "./steps/Step4Integrations";
import { Button } from "../../../components/Button";

function CreateWatcherFormContent() {
  const {
    currentStep,
    handleNext,
    handleBack,
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
    canSubmit,
    handleSubmit,
    isSubmitting,
  } = useCreateWatcher();

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      paddingX={8}
      paddingY={6}
      borderRadius="2xl"
      backgroundColor="gray.900"
      borderWidth="1px"
      borderColor="gray.800"
    >
      <Box
        flex={1}
        overflowY="auto"
        paddingRight={2}
        marginRight={-2}
        sx={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "gray.800",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "gray.600",
            borderRadius: "4px",
            "&:hover": {
              background: "gray.500",
            },
          },
        }}
      >
        {currentStep === 1 && <Step1EventSource />}
        {currentStep === 2 && <Step2Conditions />}
        {currentStep === 3 && <Step3Message />}
        {currentStep === 4 && <Step4Integrations />}
      </Box>

      <Box
        flexShrink={0}
        paddingTop={6}
        borderTopWidth="1px"
        borderTopColor="gray.800"
        backgroundColor="gray.900"
      >
        <HStack justifyContent="space-between">
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
              isLoading={isSubmitting}
              disabled={!canSubmit()}
            >
              Create Alert
            </Button>
          )}
        </HStack>
      </Box>
    </Box>
  );
}

export function CreateWatcherForm() {
  return <CreateWatcherFormContent />;
}
