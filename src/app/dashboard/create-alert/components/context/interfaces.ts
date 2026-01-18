import { READY_EVENTS } from "../../../../shared/data/readyEvents";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Condition, DisplayConfig } from "../../../../shared/types";
import { SeverityType } from "../../../../shared/types";

export type Step = 1 | 2 | 3 | 4;

export interface EventInputComponent {
  internalType: string;
  components: EventInputComponent[];
  name: string;
  type: string;
}

export interface EventInput {
  indexed: boolean;
  internalType: string;
  name: string;
  type: string;
  components?: EventInputComponent[];
}

export interface Event {
  anonymous: boolean;
  inputs: EventInput[];
  name: string;
  type: string;
}

// Re-export shared types for backward compatibility
export type { Condition, DisplayConfig };

export interface CreateWatcherContextType {
  // Step management
  currentStep: Step;
  setCurrentStep: (step: Step) => void;
  handleNext: () => void;
  handleBack: () => void;

  // Step 1: Event Source
  chainId: string;
  setChainId: (id: string) => void;
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
  setConditions: (conditions: Condition[] | ((prev: Condition[]) => Condition[])) => void;
  eventArgs: any[];
  setIsContractAddressVerified: (verified: boolean) => void;

  // Step 3: Message
  watcherLabel: string;
  setWatcherLabel: (label: string) => void;
  displayConfig: DisplayConfig;
  setDisplayConfig: (config: DisplayConfig | ((prev: DisplayConfig) => DisplayConfig)) => void;

  // Step 4: Integrations
  selectedTeamIntegrationIds: Id<"team_integrations">[];
  setSelectedTeamIntegrationIds: (ids: Id<"team_integrations">[]) => void;
  severity: SeverityType;
  setSeverity: (severity: SeverityType) => void;

  // Data
  teamIntegrations: any[] | undefined;
  selectedTemplate: (typeof READY_EVENTS)[number] | null;

  // Actions
  handleSubmit: () => Promise<void>;
  isSubmitting: boolean;

  // Validation
  canProceedToStep2: () => boolean;
  canProceedToStep3: () => boolean;
  canProceedToStep4: () => boolean;
  canSubmit: () => boolean;
}
