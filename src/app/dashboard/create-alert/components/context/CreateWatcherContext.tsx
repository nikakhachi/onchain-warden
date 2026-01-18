"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { isAddress, getAddress } from "viem";
import { useUser } from "../../../../providers/UserContext";
import { useToast } from "../../../../providers/ToastContext";
import { READY_EVENTS } from "../../../../shared/data/readyEvents";
import { Condition, CreateWatcherContextType, DisplayConfig, Step } from "./interfaces";
import { eventToAbi, eventToFormattedArgs, normalizeDisplayConfig, getConditionError } from "@/app/shared/helpers";
import { validateFormula, validateConditionFormula } from "../../../../../../convex/helpers/formulaUtils";
import { Event } from "./interfaces";
import { SeverityType } from "../../../../../../convex/data/severities";

const CreateWatcherContext = createContext<CreateWatcherContextType | undefined>(undefined);

export function CreateWatcherProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { teamIntegrations, createEventWatcher, currentTeamId } = useUser();
  const { error: showError, success: showSuccess } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1
  const [watcherLabel, setWatcherLabel] = useState("");
  const [chainId, setChainId] = useState("1"); // default to Ethereum
  const [contractAddress, setContractAddress] = useState("");
  const [eventAbi, setEventAbi] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [selectedEventIndex, setSelectedEventIndex] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Step 2: Conditions
  const [isContractAddressVerified, setIsContractAddressVerified] = useState(false);
  const [conditions, setConditions] = useState<Condition[]>([]);

  // Step 3: Message
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
    timestamp: true,
    label: true,
    chain: true,
    contract_address: false,
    event_abi: false,
    explorer_link: true,
    layerzer_link: false,
    args: [],
    severity: false,
  });

  // Step 4: Integrations
  const [selectedTeamIntegrationIds, setSelectedTeamIntegrationIds] = useState<Id<"team_integrations">[]>([]);
  const [severity, setSeverity] = useState<SeverityType>("info");

  // General state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eventArgs = useMemo(() => {
    if (selectedEvent && selectedEvent.inputs) return eventToFormattedArgs(selectedEvent);

    return [];
  }, [selectedEvent]);

  // Initialize display args when event is selected or when template is used
  useEffect(() => {
    if (eventArgs.length > 0) {
      const args = eventArgs.map((input: any) => ({
        key: input.name,
        label: input.name,
        decimals: undefined, // Start empty, will be treated as 0 in backend
      }));
      setDisplayConfig((prev) => ({
        ...prev,
        args,
      }));
    }
  }, [eventArgs]);

  const handleAddressChange = (value: string) => {
    setContractAddress(value);
    if (!useTemplate) {
      setEventAbi("");
      setSelectedEventIndex("");
      setSelectedEvent(null);
      setAvailableEvents([]);
    }
  };

  const handleEventSelect = (index: string) => {
    setSelectedEventIndex(index);
    const event = availableEvents[parseInt(index, 10)];
    if (event) {
      setSelectedEvent(event);
      setEventAbi(eventToAbi(event));
    }
  };

  const selectedTemplate = selectedTemplateIndex !== null ? READY_EVENTS[selectedTemplateIndex] : null;

  const canProceedToStep2 = (): boolean => {
    return (
      Boolean(chainId) &&
      Boolean(watcherLabel) &&
      Boolean(eventAbi) &&
      Boolean(selectedEvent) &&
      (useTemplate && !selectedTemplate?.contract_address
        ? true
        : Boolean(isAddress(contractAddress.trim())) && (useTemplate ? selectedTemplateIndex !== null : true))
    );
  };

  // Validate condition value based on argument type - uses shared helper function
  const validateConditionValue = (condition: Condition): string | undefined => {
    return getConditionError(condition, eventArgs);
  };

  const canProceedToStep3 = () => {
    // Check if contract_address is required and filled (when template.contract_address is undefined)
    if (!Boolean(contractAddress.trim())) return false;

    // If template requires contract address, check event verification
    if (useTemplate && selectedTemplate?.contract_address === undefined) {
      if (!isContractAddressVerified) return false;
    }

    // Check if all required conditions have values
    const requiredConditions = conditions.filter((c) => c.required);
    const allRequiredFilled = requiredConditions.every((condition) => condition.value.trim() !== "");
    if (!allRequiredFilled) return false;

    // Validate all conditions that have values
    const conditionsWithValues = conditions.filter((c) => c.field && c.value.trim() !== "");

    // Validate standard conditions
    const standardConditions = conditionsWithValues.filter((c) => c.operator !== "custom_formula");
    const allStandardValid = standardConditions.every((condition) => !validateConditionValue(condition));
    if (!allStandardValid) return false;

    // Validate custom formula conditions
    const customFormulaConditions = conditionsWithValues.filter((c) => c.operator === "custom_formula");
    const allFormulasValid = customFormulaConditions.every((condition) => {
      const validation = validateConditionFormula(condition.value, condition.field);
      return validation.isValid;
    });

    return allFormulasValid;
  };

  const canProceedToStep4 = () => {
    // Validate all formulas in displayConfig.args
    for (const arg of displayConfig.args) {
      if (arg.formula && arg.formula.trim() !== "") {
        const validation = validateFormula(arg.formula);
        if (!validation.isValid) {
          return false;
        }
      }
    }
    return true;
  };

  const canSubmit = () => {
    // Must have at least one integration selected
    return selectedTeamIntegrationIds.length > 0;
  };

  // Clean up empty non-required conditions when leaving step 2
  const cleanupEmptyConditions = () => {
    setConditions((prevConditions) => {
      return prevConditions.filter(
        (condition) => condition.required || (condition.field.trim() !== "" && condition.value.trim() !== ""),
      );
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      cleanupEmptyConditions();
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedToStep4()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Clean up empty conditions when leaving step 2
      if (currentStep === 2) {
        cleanupEmptyConditions();
      }
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleSubmit = async () => {
    if (!currentTeamId) {
      showError("No team selected");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanedConditions = conditions.map(({ required, ...condition }) => condition);

      await createEventWatcher({
        team_id: currentTeamId,
        chain_id: Number(chainId),
        contract_address: getAddress(contractAddress.trim()),
        event_abi: eventAbi,
        condition: cleanedConditions.length > 0 ? cleanedConditions : [],
        label: watcherLabel,
        display: normalizeDisplayConfig(displayConfig),
        team_integration_ids: selectedTeamIntegrationIds,
        severity,
      });

      showSuccess("Alert created successfully");
      router.push("/dashboard/alerts");
    } catch (error: any) {
      showError(error.data || "Failed to create alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const value: CreateWatcherContextType = {
    // Step management
    currentStep,
    setCurrentStep,
    handleNext,
    handleBack,

    // Step 1
    watcherLabel,
    setWatcherLabel,
    chainId,
    setChainId,
    contractAddress,
    setContractAddress,
    eventAbi,
    setEventAbi,
    useTemplate,
    setUseTemplate,
    selectedTemplateIndex,
    setSelectedTemplateIndex,
    availableEvents,
    selectedEventIndex,
    setSelectedEventIndex,
    selectedEvent,
    setSelectedEvent,
    handleAddressChange,
    handleEventSelect,
    setAvailableEvents,

    // Step 2
    conditions,
    setConditions,
    eventArgs,
    setIsContractAddressVerified,

    // Step 3
    displayConfig,
    setDisplayConfig,

    // Step 4
    selectedTeamIntegrationIds,
    setSelectedTeamIntegrationIds,
    severity,
    setSeverity,

    // Data
    teamIntegrations,
    selectedTemplate,

    // Actions
    handleSubmit,
    isSubmitting,

    // Validation
    canProceedToStep2,
    canProceedToStep3,
    canProceedToStep4,
    canSubmit,
  };

  return <CreateWatcherContext.Provider value={value}>{children}</CreateWatcherContext.Provider>;
}

export function useCreateWatcher() {
  const context = useContext(CreateWatcherContext);
  if (context === undefined) {
    throw new Error("useCreateWatcher must be used within CreateWatcherProvider");
  }
  return context;
}
