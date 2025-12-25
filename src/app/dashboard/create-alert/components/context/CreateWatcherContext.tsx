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
import { parseAbiItem, isAddress, getAddress } from "viem";
import { useUser } from "../../../../providers/UserContext";
import { useToast } from "../../../../providers/ToastContext";
import { READY_EVENTS } from "../../../../data/readyEvents";
import {
  Condition,
  CreateWatcherContextType,
  DisplayConfig,
  Step,
} from "./interfaces";

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
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [selectedEventIndex, setSelectedEventIndex] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

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
  const [submitError, setSubmitError] = useState("");

  // Initialize display args when event is selected or when template is used
  useEffect(() => {
    // Use getEventArgs() to ensure consistent name generation (argument0, argument1, etc.)
    const eventArgs = getEventArgs();
    if (eventArgs.length > 0) {
      const args = eventArgs.map((input: any) => ({
        key: input.name, // getEventArgs() already ensures name is set (either from input.name or argument${idx})
        label: input.name,
        decimals: undefined, // Start empty, will be treated as 0 in backend
      }));
      setDisplayConfig((prev) => ({
        ...prev,
        args,
      }));
    }
  }, [selectedEvent, useTemplate, selectedTemplateIndex, eventAbi]);

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
      // Format the event ABI as a string
      const inputs =
        event.inputs
          ?.map((input: any) => {
            const indexed = input.indexed ? "indexed " : "";
            const name = input.name || "";
            return `${input.type} ${indexed}${name}`.trim();
          })
          .join(", ") || "";
      const abiString = `event ${event.name}(${inputs})`;
      setEventAbi(abiString);
    }
  };

  const getEventArgs = () => {
    // First, try to get from selectedEvent (when event is fetched from contract)
    if (selectedEvent && selectedEvent.inputs) {
      return selectedEvent.inputs.map((input: any, idx: number) => ({
        ...input,
        name: input.name || `argument${idx}`,
      }));
    }

    // If using a template and selectedEvent is not available, parse from template's event_abi
    if (useTemplate && selectedTemplateIndex !== null) {
      const template = READY_EVENTS[selectedTemplateIndex];
      if (template?.event_abi) {
        try {
          const parsed = parseAbiItem(template.event_abi) as any;
          if (parsed.type === "event" && parsed.inputs) {
            return parsed.inputs.map((input: any, idx: number) => ({
              name: input.name || `argument${idx}`,
              type: input.type || "",
              indexed: input.indexed || false,
              internalType: input.internalType || "",
            }));
          }
        } catch (error) {
          console.error("Error parsing template event ABI:", error);
          // Fallback: try to parse manually from event_abi string
          try {
            const match = template.event_abi.match(/event\s+\w+\s*\(([^)]+)\)/);
            if (match && match[1]) {
              const args = match[1].split(",").map((arg, idx) => {
                const parts = arg.trim().split(/\s+/);
                const indexed = arg.includes("indexed");
                const type = parts[0] || "unknown";
                // Check if last part is a type (starts with lowercase) or a name
                const lastPart = parts[parts.length - 1];
                const isType =
                  lastPart &&
                  /^(address|uint|int|bytes|bool|string)/.test(
                    lastPart.toLowerCase()
                  );
                const name = isType
                  ? `argument${idx}`
                  : lastPart || `argument${idx}`;
                return {
                  name: name,
                  type: type,
                  indexed: indexed,
                  internalType: type,
                };
              });
              return args;
            }
          } catch (fallbackError) {
            console.error("Error in fallback parsing:", fallbackError);
          }
        }
      }
    }

    // Fallback: try to parse from eventAbi string if available
    if (eventAbi) {
      try {
        const parsed = parseAbiItem(eventAbi) as any;
        if (parsed.type === "event" && parsed.inputs) {
          return parsed.inputs.map((input: any, idx: number) => ({
            name: input.name || `argument${idx}`,
            type: input.type || "",
            indexed: input.indexed || false,
            internalType: input.internalType || "",
          }));
        }
      } catch (error) {
        console.error("Error parsing eventAbi:", error);
      }
    }

    return [];
  };

  const eventArgs = getEventArgs();
  const selectedTemplate =
    selectedTemplateIndex !== null ? READY_EVENTS[selectedTemplateIndex] : null;

  const canProceedToStep2 = (): boolean => {
    const hasValidAddress = Boolean(isAddress(contractAddress.trim()));
    const hasEventAbi = Boolean(eventAbi && eventAbi.trim().length > 0);
    const hasSelectedEvent =
      selectedEvent !== null && selectedEvent !== undefined;
    const hasWatcherLabel = Boolean(watcherLabel);
    const hasChainId = Boolean(chainId);

    if (useTemplate) {
      // For templates, we only need the template selected and watcher label
      // Contract address requirement (if template.contract_address is undefined) is checked in Step 2
      return selectedTemplateIndex !== null && hasWatcherLabel;
    } else {
      return (
        hasChainId &&
        hasValidAddress &&
        hasEventAbi &&
        hasSelectedEvent &&
        hasWatcherLabel
      );
    }
  };

  // Validate condition value based on argument type
  const validateConditionValue = (condition: Condition): string | undefined => {
    if (!condition.field || !condition.value.trim()) {
      return undefined;
    }

    const selectedArg = eventArgs.find(
      (a: any) =>
        a.name === condition.field || a.internalType === condition.field
    );

    if (!selectedArg?.type) {
      return undefined;
    }

    const value = condition.value.trim();
    const argType = selectedArg.type;

    // Validate address type
    if (argType === "address") {
      if (!isAddress(value)) {
        return "Invalid EVM address format";
      }
    }
    // Validate uint/int types - must be valid integers
    else if (argType.includes("uint") || argType.includes("int")) {
      const numValue = value.startsWith("-") ? value.slice(1) : value;
      if (!/^\d+$/.test(numValue)) {
        return "Must be a valid number";
      }
      // Check if it's a valid integer within reasonable bounds
      try {
        const parsed = BigInt(value);
        if (argType.includes("uint") && parsed < BigInt(0)) {
          return "Must be a non-negative number";
        }
      } catch {
        return "Invalid number format";
      }
    }
    // Validate bytes types - must be valid hex string
    else if (argType.startsWith("bytes")) {
      if (!value.startsWith("0x")) {
        return "Must start with 0x";
      }
      const hexPart = value.slice(2);
      if (!/^[0-9a-fA-F]+$/.test(hexPart)) {
        return "Invalid hex format";
      }
    }

    return undefined;
  };

  const canProceedToStep3 = () => {
    // Check if contract_address is required and filled (when template.contract_address is undefined)
    if (useTemplate && selectedTemplateIndex !== null) {
      const template = READY_EVENTS[selectedTemplateIndex];
      const requiresContractAddress = template?.contract_address === undefined;

      if (requiresContractAddress) {
        const hasValidAddress = Boolean(isAddress(contractAddress.trim()));
        if (!hasValidAddress) {
          return false;
        }
      }
    }

    // Check if all required conditions have values
    const requiredConditions = conditions.filter((c) => c.required);
    if (requiredConditions.length > 0) {
      const allRequiredFilled = requiredConditions.every(
        (condition) => condition.value.trim() !== ""
      );
      if (!allRequiredFilled) {
        return false;
      }
    }

    // Validate all conditions that have values
    const conditionsWithValues = conditions.filter(
      (c) => c.field && c.value.trim() !== ""
    );
    const allValid = conditionsWithValues.every(
      (condition) => !validateConditionValue(condition)
    );

    return allValid;
  };

  const canProceedToStep4 = () => !!watcherLabel;

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
    // Get the actual event ABI to use - from template if available, otherwise from state
    const finalEventAbi =
      useTemplate && selectedTemplateIndex !== null
        ? READY_EVENTS[selectedTemplateIndex]?.event_abi || eventAbi
        : eventAbi;

    // Get the contract address - from template if available, otherwise from state
    const finalContractAddress =
      useTemplate && selectedTemplateIndex !== null
        ? READY_EVENTS[selectedTemplateIndex]?.contract_address ||
          contractAddress
        : contractAddress;

    setIsSubmitting(true);
    setSubmitError("");

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
          decimals: arg.decimals !== undefined ? arg.decimals : 0,
        })),
      };

      await createEventWatcher({
        chain_convex_id: chainId!,
        contract_address: getAddress(finalContractAddress.trim()),
        event_abi: finalEventAbi,
        condition: cleanedConditions.length > 0 ? cleanedConditions : [],
        label: watcherLabel,
        display: normalizedDisplayConfig,
        owner_integration_ids: selectedOwnerIntegrationIds,
      });

      showSuccess("Alert created successfully");
      router.push("/dashboard/my-alerts");
    } catch (error) {
      showError("Failed to create alert");
      setSubmitError("Failed to create alert");
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
    submitError,

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
