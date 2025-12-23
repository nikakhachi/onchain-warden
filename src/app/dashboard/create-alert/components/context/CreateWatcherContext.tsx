"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { parseAbiItem, isAddress, getAddress } from "viem";
import { useWallet } from "../../../../providers/WalletContext";
import { useToast } from "../../../../providers/ToastContext";
import { READY_EVENTS } from "../../../../data/readyEvents";

type Step = 1 | 2 | 3 | 4;

interface Condition {
  field: string;
  operator: string;
  value: string;
  required?: boolean;
}

interface DisplayConfig {
  timestamp: boolean;
  label: boolean;
  chain: boolean;
  contract_address: boolean;
  event_abi: boolean;
  explorer_link: boolean;
  layerzer_link: boolean;
  args: Array<{ key: string; label?: string; decimals?: number }>;
}

interface CreateWatcherContextType {
  // Step management
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  handleNext: () => void;
  handleBack: () => void;

  // Step 1: Event Source
  chainId: Id<"chains"> | "";
  setChainId: (id: Id<"chains"> | "") => void;
  contractAddress: string;
  setContractAddress: (address: string) => void;
  eventAbi: string;
  setEventAbi: (abi: string) => void;
  useTemplate: boolean;
  setUseTemplate: (use: boolean) => void;
  selectedTemplateIndex: number | null;
  setSelectedTemplateIndex: (index: number | null) => void;
  availableEvents: any[];
  isFetchingEvents: boolean;
  eventsFetchError: string;
  selectedEventIndex: string;
  setSelectedEventIndex: (index: string) => void;
  selectedEvent: any;
  setSelectedEvent: (event: any) => void;
  abiFetched: boolean;
  addressError: string;
  handleAddressChange: (value: string) => void;
  handleFetchAbi: () => void;
  handleEventSelect: (index: string) => void;
  handleTemplateSelect: (index: number) => void;

  // Step 2: Conditions
  conditions: Condition[];
  addCondition: () => void;
  removeCondition: (index: number) => void;
  updateCondition: (
    index: number,
    field: "field" | "operator" | "value",
    value: string
  ) => void;
  eventArgs: any[];

  // Step 3: Message
  watcherLabel: string;
  setWatcherLabel: (label: string) => void;
  displayConfig: DisplayConfig;
  setDisplayConfig: (
    config: DisplayConfig | ((prev: DisplayConfig) => DisplayConfig)
  ) => void;

  // Step 4: Integrations
  selectedOwnerIntegrationIds: Id<"owner_integrations">[];
  setSelectedOwnerIntegrationIds: (ids: Id<"owner_integrations">[]) => void;

  // Data
  chains: any[] | undefined;
  integrations: any[] | undefined;
  ownerIntegrations: any[] | undefined;
  selectedChain: any;
  selectedTemplate: (typeof READY_EVENTS)[number] | null;

  // Actions
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;
  submitError: string;

  // Validation
  canProceedToStep2: () => boolean;
  canProceedToStep3: () => boolean;
  canProceedToStep4: () => boolean;
}

const CreateWatcherContext = createContext<
  CreateWatcherContextType | undefined
>(undefined);

export function CreateWatcherProvider({ children }: { children: ReactNode }) {
  const { isConnected, address, getAccessToken, isAuthenticating } =
    useWallet();
  const { error: showError, success: showSuccess } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Step 1: Event Source
  const [chainId, setChainId] = useState<Id<"chains"> | "">("");
  const [contractAddress, setContractAddress] = useState("");
  const [eventAbi, setEventAbi] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<
    number | null
  >(null);
  const [availableEvents, setAvailableEvents] = useState<any[]>([]);
  const [isFetchingEvents, setIsFetchingEvents] = useState(false);
  const [eventsFetchError, setEventsFetchError] = useState("");
  const [selectedEventIndex, setSelectedEventIndex] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [abiFetched, setAbiFetched] = useState(false);
  const [addressError, setAddressError] = useState("");

  // Step 2: Conditions
  const [conditions, setConditions] = useState<Condition[]>([]);

  // Step 3: Message
  const [watcherLabel, setWatcherLabel] = useState("");
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
    timestamp: true,
    label: true,
    chain: true,
    contract_address: true,
    event_abi: true,
    explorer_link: true,
    layerzer_link: true,
    args: [],
  });

  // Step 4: Integrations
  const [selectedOwnerIntegrationIds, setSelectedOwnerIntegrationIds] =
    useState<Id<"owner_integrations">[]>([]);

  // General state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const chains = useQuery(api.chains.getChains);
  const integrations = useQuery(api.integrations.getIntegrations);
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    address ? { owner: address } : "skip"
  );

  const createEventWatcher = useAction(
    api.eventWatchers.createEventWatcherAction
  );

  const selectedChain = chains?.find((c) => c._id === chainId);

  // Fetch events when contract address is valid and chain is selected
  useEffect(() => {
    const fetchEvents = async () => {
      if (!contractAddress.trim() || !isAddress(contractAddress.trim())) {
        return;
      }

      if (!chainId) {
        return;
      }

      const selectedChain = chains?.find((c) => c._id === chainId);
      if (!selectedChain) {
        return;
      }

      setIsFetchingEvents(true);
      setEventsFetchError("");

      try {
        const url = new URL("/api/fetch-events", window.location.origin);
        url.searchParams.set("contract_address", contractAddress.trim());
        url.searchParams.set("chain_id", selectedChain.chain_id.toString());

        const response = await fetch(url.toString());

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch events");
        }

        const events = await response.json();
        if (Array.isArray(events) && events.length > 0) {
          setAvailableEvents(events);
          setAbiFetched(true);
        } else {
          throw new Error("No events found in contract ABI");
        }
      } catch (error) {
        setEventsFetchError(
          error instanceof Error ? error.message : "Failed to fetch events"
        );
        setAvailableEvents([]);
        setAbiFetched(false);
      } finally {
        setIsFetchingEvents(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [contractAddress, chainId, chains]);

  // Auto-select event from template
  useEffect(() => {
    if (selectedTemplateIndex !== null && availableEvents.length > 0) {
      const template = READY_EVENTS[selectedTemplateIndex];
      if (!template) return;

      try {
        const parsedTemplateEvent = parseAbiItem(template.event_abi) as any;
        let templateEventName: string | undefined;

        if (parsedTemplateEvent.type === "event" && parsedTemplateEvent.name) {
          templateEventName = parsedTemplateEvent.name;
        } else {
          const match = template.event_abi.match(/event\s+(\w+)\s*\(/);
          if (match && match[1]) {
            templateEventName = match[1];
          }
        }

        if (templateEventName) {
          const matchingEventIndex = availableEvents.findIndex(
            (event) => event.name === templateEventName
          );
          if (matchingEventIndex !== -1) {
            const event = availableEvents[matchingEventIndex];
            setSelectedEventIndex(matchingEventIndex.toString());
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
        }
      } catch (error) {
        console.error("Error parsing template event:", error);
      }
    }
  }, [selectedTemplateIndex, availableEvents]);

  // Initialize display args when event is selected
  useEffect(() => {
    if (selectedEvent && selectedEvent.inputs) {
      const args = selectedEvent.inputs.map((input: any) => ({
        key: input.name || input.internalType || `arg${input.index}`,
        label: input.name || input.internalType || `arg${input.index}`,
        decimals: input.type?.includes("uint") ? 0 : undefined,
      }));
      setDisplayConfig((prev) => ({
        ...prev,
        args,
      }));
    }
  }, [selectedEvent]);

  // Auto-add conditions for required event arguments when template is selected
  useEffect(() => {
    if (
      useTemplate &&
      selectedTemplateIndex !== null &&
      selectedEvent?.inputs
    ) {
      const template = READY_EVENTS[selectedTemplateIndex];
      const requiredArgs =
        template?.required?.filter((req) => req !== "contract_address") || [];

      // Remove all required conditions from previous template
      const nonRequiredConditions = conditions.filter((c) => !c.required);

      // Add new required conditions for current template
      const newRequiredConditions = requiredArgs.map((reqArg) => ({
        field: reqArg,
        operator: "==",
        value: "",
        required: true,
      }));

      // Combine non-required conditions with new required conditions
      setConditions([...nonRequiredConditions, ...newRequiredConditions]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useTemplate, selectedTemplateIndex, selectedEvent]);

  const validateAddress = (address: string) => {
    if (!address.trim()) {
      setAddressError("");
      return false;
    }
    if (!isAddress(address.trim())) {
      setAddressError("Invalid EVM address format");
      return false;
    }
    setAddressError("");
    return true;
  };

  const handleAddressChange = (value: string) => {
    setContractAddress(value);
    validateAddress(value);
    setAbiFetched(false);
    setEventAbi("");
    setSelectedEventIndex("");
    setSelectedEvent(null);
    setAvailableEvents([]);
  };

  const handleFetchAbi = async () => {
    if (!contractAddress.trim() || !isAddress(contractAddress.trim())) {
      setAddressError("Invalid address");
      return;
    }
    if (!chainId) {
      return;
    }
    // The useEffect will handle fetching
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

  const handleTemplateSelect = (index: number) => {
    setSelectedTemplateIndex(index);
    const template = READY_EVENTS[index];
    if (template) {
      setChainId(
        chains?.find((c) => c.chain_id === template.chain_id)?._id || ""
      );
      setContractAddress(template.contract_address || ""); // Set to empty if undefined
      setEventAbi(template.event_abi); // Set event ABI immediately from template
      setUseTemplate(true);
    }
  };

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: "", operator: "==", value: "", required: false },
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: "field" | "operator" | "value",
    value: string
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  const getEventArgs = () => {
    if (!selectedEvent || !selectedEvent.inputs) return [];
    return selectedEvent.inputs;
  };

  const eventArgs = getEventArgs();
  const selectedTemplate =
    selectedTemplateIndex !== null ? READY_EVENTS[selectedTemplateIndex] : null;

  const canProceedToStep2 = (): boolean => {
    const hasValidAddress = Boolean(
      contractAddress && isAddress(contractAddress.trim())
    );
    const hasEventAbi = Boolean(eventAbi && eventAbi.trim().length > 0);
    const hasSelectedEvent =
      selectedEvent !== null && selectedEvent !== undefined;
    const hasWatcherLabel = Boolean(
      watcherLabel && watcherLabel.trim().length > 0
    );
    const hasChainId = chainId !== "";

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

  const canProceedToStep3 = () => {
    // Check if contract_address is required and filled (when template.contract_address is undefined)
    if (useTemplate && selectedTemplateIndex !== null) {
      const template = READY_EVENTS[selectedTemplateIndex];
      const requiresContractAddress = template?.contract_address === undefined;

      if (requiresContractAddress) {
        const hasValidAddress = Boolean(
          contractAddress && isAddress(contractAddress.trim())
        );
        if (!hasValidAddress) {
          return false;
        }
      }
    }

    // Check if all required conditions have values
    const requiredConditions = conditions.filter((c) => c.required);
    if (requiredConditions.length > 0) {
      return requiredConditions.every(
        (condition) => condition.value.trim() !== ""
      );
    }

    return true; // No required conditions or all filled
  };

  const canProceedToStep4 = () => {
    return watcherLabel.trim() !== "";
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3()) {
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceedToStep4()) {
      setCurrentStep(4);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
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

    if (!address || !chainId || !finalContractAddress || !finalEventAbi) {
      setSubmitError("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to authenticate. Please try again.");
      }

      await createEventWatcher({
        chain_convex_id: chainId,
        contract_address: getAddress(finalContractAddress.trim()),
        event_abi: finalEventAbi,
        condition: conditions.length > 0 ? conditions : [],
        label: watcherLabel,
        display: displayConfig,
        owner_integration_ids: selectedOwnerIntegrationIds,
        accessToken,
      });

      // Success - show success message and redirect
      showSuccess("Alert created successfully");
      router.push("/dashboard/my-alerts");
    } catch (error) {
      showError(
        error instanceof Error ? error.message : "Failed to create alert"
      );
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create alert"
      );
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
    isFetchingEvents,
    eventsFetchError,
    selectedEventIndex,
    setSelectedEventIndex,
    selectedEvent,
    setSelectedEvent,
    abiFetched,
    addressError,
    handleAddressChange,
    handleFetchAbi,
    handleEventSelect,
    handleTemplateSelect,

    // Step 2
    conditions,
    addCondition,
    removeCondition,
    updateCondition,
    eventArgs,

    // Step 3
    watcherLabel,
    setWatcherLabel,
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
