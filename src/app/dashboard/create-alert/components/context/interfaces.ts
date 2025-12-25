import { READY_EVENTS } from "@/app/data/readyEvents";
import { Id } from "../../../../../../convex/_generated/dataModel";

export type Step = 1 | 2 | 3 | 4;

export interface Condition {
  field: string;
  operator: string;
  value: string;
  required?: boolean;
}

export interface DisplayConfig {
  timestamp: boolean;
  label: boolean;
  chain: boolean;
  contract_address: boolean;
  event_abi: boolean;
  explorer_link: boolean;
  layerzer_link: boolean;
  args: Array<{ key: string; label?: string; decimals?: number }>;
}

export interface CreateWatcherContextType {
  // Step management
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  handleNext: () => void;
  handleBack: () => void;

  // Step 1: Event Source
  chainId: Id<"chains"> | undefined;
  setChainId: (id: Id<"chains">) => void;
  contractAddress: string;
  setContractAddress: (address: string) => void;
  eventAbi: string;
  setEventAbi: (abi: string) => void;
  useTemplate: boolean;
  setUseTemplate: (use: boolean) => void;
  selectedTemplateIndex: number | null;
  setSelectedTemplateIndex: (index: number | null) => void;
  availableEvents: any[];
  selectedEventIndex: string;
  setSelectedEventIndex: (index: string) => void;
  selectedEvent: any;
  setSelectedEvent: (event: any) => void;
  handleAddressChange: (value: string) => void;
  handleEventSelect: (index: string) => void;
  setAvailableEvents: (events: any[]) => void;

  // Step 2: Conditions
  conditions: Condition[];
  setConditions: (
    conditions: Condition[] | ((prev: Condition[]) => Condition[])
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
  canSubmit: () => boolean;
}
