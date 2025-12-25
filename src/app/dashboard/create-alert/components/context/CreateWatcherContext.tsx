"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { isAddress, getAddress } from "viem";
import { useUser } from "../../../../providers/UserContext";
import { useToast } from "../../../../providers/ToastContext";
import { READY_EVENTS } from "../../../../data/readyEvents";
import {
  Condition,
  CreateWatcherContextType,
  DisplayConfig,
  Step,
} from "./interfaces";
import { eventToAbi, eventToFormattedArgs } from "@/app/helpers";
import { Event } from "./interfaces";

const CreateWatcherContext = createContext<
  CreateWatcherContextType | undefined
>(undefined);

export function CreateWatcherProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { integrations, ownerIntegrations, createEventWatcher } = useUser();
  const chains = useQuery(api.chains.getChains);
  const { error: showError, success: showSuccess } = useToast();

  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1
  const [watcherLabel, setWatcherLabel] = useState("");
  const [chainId, setChainId] = useState<Id<"chains">>();
  const selectedChain = useMemo(
    () => chains?.find((c) => c._id === chainId),
    [chainId, chains]
  );
  const [contractAddress, setContractAddress] = useState("");
  const [eventAbi, setEventAbi] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<
    number | null
  >(null);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [selectedEventIndex, setSelectedEventIndex] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Step 2: Conditions
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
  const [selectedOwnerIntegrationIds, setSelectedOwnerIntegrationIds] =
    useState<Id<"owner_integrations">[]>([]);

  // General state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (chains?.length && !chainId) setChainId(chains[0]?._id);
  }, [chains]);

  const eventArgs = useMemo(() => {
    if (selectedEvent && selectedEvent.inputs)
      return eventToFormattedArgs(selectedEvent);

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
    setEventAbi("");
    setSelectedEventIndex("");
    setSelectedEvent(null);
    setAvailableEvents([]);
  };

  const handleEventSelect = (index: string) => {
    setSelectedEventIndex(index);
    const event = availableEvents[parseInt(index, 10)];
    if (event) {
      setSelectedEvent(event);
      setEventAbi(eventToAbi(event));
    }
  };

  const selectedTemplate =
    selectedTemplateIndex !== null ? READY_EVENTS[selectedTemplateIndex] : null;

  const canProceedToStep2 = (): boolean => {
    return (
      Boolean(chainId) &&
      Boolean(watcherLabel) &&
      Boolean(eventAbi) &&
      Boolean(selectedEvent) &&
      (useTemplate && !selectedTemplate?.contract_address
        ? true
        : Boolean(isAddress(contractAddress.trim())) &&
          (useTemplate ? selectedTemplateIndex !== null : true))
    );
  };

  // Validate condition value based on argument type
  const validateConditionValue = (condition: Condition): string | undefined => {
    if (!condition.field || !condition.value.trim()) return undefined;

    const selectedArg = eventArgs.find(
      (a: any) =>
        a.name === condition.field || a.internalType === condition.field
    );

    if (!selectedArg?.type) return undefined;

    const value = condition.value.trim();
    const argType = selectedArg.type;

    if (argType === "address" && !isAddress(value))
      return "Invalid EVM address format";

    if (argType.includes("uint") || argType.includes("int")) {
      const numValue = value.startsWith("-") ? value.slice(1) : value;
      if (!/^\d+$/.test(numValue)) return "Must be a valid number";
      try {
        const parsed = BigInt(value);
        if (argType.includes("uint") && parsed < BigInt(0))
          return "Must be a non-negative number";
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

    // Check if all required conditions have values
    const requiredConditions = conditions.filter((c) => c.required);
    const allRequiredFilled = requiredConditions.every(
      (condition) => condition.value.trim() !== ""
    );
    if (!allRequiredFilled) return false;

    // Validate all conditions that have values
    const conditionsWithValues = conditions.filter(
      (c) => c.field && c.value.trim() !== ""
    );
    const allValid = conditionsWithValues.every(
      (condition) => !validateConditionValue(condition)
    );

    return allValid;
  };

  const canProceedToStep4 = () => true;

  const canSubmit = () => {
    // Must have at least one integration selected
    return selectedOwnerIntegrationIds.length > 0;
  };

  // Clean up empty non-required conditions when leaving step 2
  const cleanupEmptyConditions = () => {
    setConditions((prevConditions) => {
      return prevConditions.filter(
        (condition) =>
          condition.required ||
          (condition.field.trim() !== "" && condition.value.trim() !== "")
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
    setIsSubmitting(true);

    try {
      // Remove 'required' field from conditions before submitting (frontend-only field)
      const cleanedConditions = conditions.map(
        ({ required, ...condition }) => condition
      );

      // Normalize display config: convert undefined decimals to 0 for backend
      const normalizedDisplayConfig = {
        ...displayConfig,
        args: displayConfig.args.map((arg) => ({
          ...arg,
          decimals: arg.decimals || 0,
        })),
      };

      await createEventWatcher({
        chain_convex_id: chainId!,
        contract_address: getAddress(contractAddress.trim()),
        event_abi: eventAbi,
        condition: cleanedConditions.length > 0 ? cleanedConditions : [],
        label: watcherLabel,
        display: normalizedDisplayConfig,
        owner_integration_ids: selectedOwnerIntegrationIds,
      });

      showSuccess("Alert created successfully");
      router.push("/dashboard/my-alerts");
    } catch (error) {
      showError("Failed to create alert");
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

    // Step 3
    displayConfig,
    setDisplayConfig,

    // Step 4
    selectedOwnerIntegrationIds,
    setSelectedOwnerIntegrationIds,

    // Data
    chains,
    integrations,
    ownerIntegrations,
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

  return (
    <CreateWatcherContext.Provider value={value}>
      {children}
    </CreateWatcherContext.Provider>
  );
}

export function useCreateWatcher() {
  const context = useContext(CreateWatcherContext);
  if (context === undefined) {
    throw new Error(
      "useCreateWatcher must be used within CreateWatcherProvider"
    );
  }
  return context;
}
