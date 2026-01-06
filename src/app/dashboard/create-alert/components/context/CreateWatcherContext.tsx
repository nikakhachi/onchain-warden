"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { isAddress, getAddress } from "viem";
import { useUser } from "../../../../providers/UserContext";
import { useToast } from "../../../../providers/ToastContext";
import { READY_EVENTS } from "../../../../shared/data/readyEvents";
import { Condition, CreateWatcherContextType, DisplayConfig, Step } from "./interfaces";
import { eventToAbi, eventToFormattedArgs, normalizeDisplayConfig } from "@/app/shared/helpers";
import { validateFormula } from "../../../../../../convex/helpers/formulaUtils";
import { Event } from "./interfaces";

const CreateWatcherContext = createContext<CreateWatcherContextType | undefined>(undefined);

export function CreateWatcherProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { integrations, teamIntegrations, createEventWatcher, currentTeamId } = useUser();
  const chains = useQuery(api.chains.getChains);
  const { error: showError, success: showSuccess } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1
  const [watcherLabel, setWatcherLabel] = useState("");
  const [chainId, setChainId] = useState<Id<"chains">>();
  const selectedChain = useMemo(() => chains?.find((c) => c._id === chainId), [chainId, chains]);
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
  });

  // Step 4: Integrations
  const [selectedTeamIntegrationIds, setSelectedTeamIntegrationIds] = useState<Id<"team_integrations">[]>([]);

  // General state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (chains?.length && !chainId) setChainId(chains[0]?._id);
  }, [chains]);

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

  // Validate condition value based on argument type
  const validateConditionValue = (condition: Condition): string | undefined => {
    if (!condition.field || !condition.value.trim()) return undefined;

    // Skip validation for custom formula conditions - they are validated separately
    if (condition.operator === "custom_formula") return undefined;

    const selectedArg = eventArgs.find((a: any) => a.name === condition.field || a.internalType === condition.field);

    if (!selectedArg?.type) return undefined;

    const value = condition.value.trim();
    const argType = selectedArg.type;

    if (argType === "address" && !isAddress(value)) return "Invalid EVM address format";

    if (argType.includes("uint") || argType.includes("int")) {
      const numValue = value.startsWith("-") ? value.slice(1) : value;
      if (!/^\d+$/.test(numValue)) return "Must be a valid number";
      try {
        const parsed = BigInt(value);
        if (argType.includes("uint") && parsed < BigInt(0)) return "Must be a non-negative number";
      } catch {
        return "Invalid number format";
      }
    }

    if (argType.startsWith("bytes")) {
      if (!value.startsWith("0x")) return "Must start with 0x";

      if (!/^[0-9a-fA-F]+$/.test(value.slice(2))) return "Invalid hex format";
    }

    return undefined;
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
      if (!condition.value || condition.value.trim() === "") return false;
      // Check if formula contains comparison operator
      const hasOperator = /[><=!]+/.test(condition.value);
      if (!hasOperator) return false;
      // Validate the formula
      const validation = validateFormula(condition.value);
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
        chain_convex_id: chainId!,
        contract_address: getAddress(contractAddress.trim()),
        event_abi: eventAbi,
        condition: cleanedConditions.length > 0 ? cleanedConditions : [],
        label: watcherLabel,
        display: normalizeDisplayConfig(displayConfig),
        team_integration_ids: selectedTeamIntegrationIds,
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

    // Data
    chains,
    integrations,
    teamIntegrations,
    selectedChain,
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
