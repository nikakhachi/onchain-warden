"use client";

import { Box, HStack } from "@chakra-ui/react";
import { useState } from "react";
import { useCreateWatcher } from "./context/CreateWatcherContext";
import { Step1EventSource } from "./steps/step1";
import { Conditions } from "../../components/AlertManagement/Conditions";
import { Message } from "../../components/AlertManagement/Message";
import { Integrations } from "../../components/AlertManagement/Integrations";
import { Preview } from "./Preview";
import { Button } from "../../../components/Button";
import { useUser } from "@/app/providers/UserContext";
import { READY_EVENTS } from "../../../shared/data/readyEvents";
import { SimulateModal } from "../../components/SimulateModal";
import { useToast } from "@/app/providers/ToastContext";

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
    // Step 2 props
    conditions,
    setConditions,
    eventArgs,
    useTemplate,
    selectedTemplate,
    contractAddress,
    handleAddressChange,
    eventAbi,
    setIsContractAddressVerified,
    // Step 3 props
    displayConfig,
    setDisplayConfig,
    watcherLabel,
    selectedTemplateIndex,
    // Step 4 props
    teamIntegrations,
    selectedTeamIntegrationIds,
    setSelectedTeamIntegrationIds,
    chainId,
  } = useCreateWatcher();
  const { simulateAlert } = useUser();
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

  const requiresContractAddress = useTemplate && selectedTemplate?.contract_address === undefined;

  // Check if contract address, chain, and event are all specified
  const displayEventAbi =
    eventAbi || (useTemplate && selectedTemplateIndex !== null ? READY_EVENTS[selectedTemplateIndex]?.event_abi : "");
  const hasRequiredFields = contractAddress.trim() !== "" && displayEventAbi.trim() !== "";
  const canSimulate =
    hasRequiredFields && canProceedToStep3() && canProceedToStep4() && selectedTeamIntegrationIds.length > 0;

  const handleSimulate = async (blockNumber: number) => {
    if (!chainId || !displayEventAbi) return;
    setIsSimulating(true);
    try {
      await simulateAlert({
        teamIntegrationIds: selectedTeamIntegrationIds,
        blockNumber,
        eventWatcher: {
          contractAddress: contractAddress.trim(),
          chainId: Number(chainId),
          eventAbi: displayEventAbi,
          conditions: conditions.map(({ required, ...c }) => c),
          display: displayConfig,
          label: watcherLabel || "",
        },
      });
      setIsSimulateModalOpen(false);
      showSuccess("Simulation alert(s) have been sent");
    } catch (error: any) {
      showError(error.message || "Failed to simulate alert");
    } finally {
      setIsSimulating(false);
    }
  };

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
        {currentStep === 2 && (
          <Conditions
            conditions={conditions}
            setConditions={setConditions}
            eventArgs={eventArgs}
            showPreview={true}
            previewComponent={<Preview />}
            requiresContractAddress={requiresContractAddress}
            contractAddress={contractAddress}
            handleAddressChange={handleAddressChange}
            eventAbi={eventAbi}
            chainId={Number(chainId)}
            setIsContractAddressVerified={setIsContractAddressVerified}
          />
        )}
        {currentStep === 3 && (
          <Message
            displayConfig={displayConfig}
            setDisplayConfig={setDisplayConfig}
            eventArgs={eventArgs}
            showPreview={true}
            previewComponent={<Preview />}
          />
        )}
        {currentStep === 4 && (
          <Integrations
            selectedIntegrationIds={selectedTeamIntegrationIds}
            setSelectedIntegrationIds={setSelectedTeamIntegrationIds}
            teamIntegrations={teamIntegrations || []}
            showPreview={true}
            previewComponent={<Preview />}
          />
        )}
      </Box>

      <Box flexShrink={0} paddingTop={6} borderTopWidth="1px" borderTopColor="gray.800" backgroundColor="gray.900">
        <HStack justifyContent="space-between">
          <Button variant="secondary" size="sm" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          <HStack gap={3}>
            <Button variant="secondary" size="sm" onClick={() => setIsSimulateModalOpen(true)} disabled={!canSimulate}>
              Simulate
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
        </HStack>
      </Box>
      <SimulateModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSimulate={handleSimulate}
        isSubmitting={isSimulating}
        selectedTeamIntegrationIds={selectedTeamIntegrationIds}
      />
    </Box>
  );
}

export function CreateWatcherForm() {
  return <CreateWatcherFormContent />;
}
