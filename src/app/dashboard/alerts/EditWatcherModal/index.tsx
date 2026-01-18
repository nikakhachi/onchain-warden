"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Doc, Id } from "../../../../../convex/_generated/dataModel";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Input,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Badge,
} from "@chakra-ui/react";
import { useUser } from "../../../providers/UserContext";
import { useToast } from "../../../providers/ToastContext";
import { Button as CustomButton } from "../../../components/Button";
import { normalizeDisplayConfig, getEventName, parseEventArgs, getConditionError } from "@/app/shared/helpers";
import { validateFormula, validateConditionFormula } from "../../../../../convex/helpers/formulaUtils";
import { Conditions } from "../../components/AlertManagement/Conditions";
import { Condition, DisplayConfig } from "@/app/shared/types";
import { Message } from "../../components/AlertManagement/Message";
import { Integrations } from "../../components/AlertManagement/Integrations";
import { SimulateModal } from "../../components/SimulateModal";
import { SeverityDropdown } from "@/app/components/SeverityDropdown";
import { SEVERITY_COLORS, SeverityType } from "../../../../../convex/data/severities";

interface EditWatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  watcher: {
    eventWatcher: Doc<"event_watchers">;
    chain: { name: string } | null;
  } | null;
}

export function EditWatcherModal({ isOpen, onClose, watcher }: EditWatcherModalProps) {
  const { updateEventWatcher, currentTeamId, watcherIntegrations, teamIntegrations, simulateAlert } = useUser();
  const { error: showError, success: showSuccess } = useToast();
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const [label, setLabel] = useState("");
  const [severity, setSeverity] = useState<SeverityType>("info");
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
    timestamp: true,
    label: true,
    chain: true,
    contract_address: true,
    event_abi: true,
    explorer_link: true,
    layerzer_link: true,
    args: [],
    severity: true,
  });
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<Id<"team_integrations">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initializedWatcherIdRef = useRef<Id<"event_watchers"> | null>(null);
  const lastSavedWatcherIdRef = useRef<Id<"event_watchers"> | null>(null);

  // Parse event arguments from ABI - handles tuples correctly
  const eventArgs = useMemo(() => {
    if (!watcher?.eventWatcher.event_abi) return [];
    return parseEventArgs(watcher.eventWatcher.event_abi);
  }, [watcher?.eventWatcher.event_abi]);
  const defaultDisplayConfig: DisplayConfig = {
    timestamp: true,
    label: true,
    chain: true,
    contract_address: true,
    event_abi: true,
    explorer_link: true,
    layerzer_link: true,
    args: [],
    severity: true,
  };

  useEffect(() => {
    if (
      watcher &&
      watcher.eventWatcher._id !== initializedWatcherIdRef.current &&
      watcher.eventWatcher._id !== lastSavedWatcherIdRef.current
    ) {
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      setLabel(watcher.eventWatcher.label || "");
      setSeverity(watcher.eventWatcher.severity || "info");
      setConditions(watcher.eventWatcher.condition || []);

      // TODO: fix after the severity is not optional
      if (watcher.eventWatcher.display) {
        setDisplayConfig({
          ...watcher.eventWatcher.display,
          severity: watcher.eventWatcher.display.severity ?? (watcher.eventWatcher.severity ? true : false),
        });
      } else {
        setDisplayConfig(defaultDisplayConfig);
      }

      // Get team_integration_ids from watcherIntegrations
      const watcherIntegrationIds =
        watcherIntegrations
          ?.filter((wi) => wi.event_watcher_id === watcher.eventWatcher._id)
          .map((wi) => wi.team_integration_id) || [];
      setSelectedIntegrationIds(watcherIntegrationIds);
    }
  }, [watcher?.eventWatcher._id, isOpen, watcherIntegrations]);

  // Reset refs when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedWatcherIdRef.current = null;
      lastSavedWatcherIdRef.current = null;
    }
  }, [isOpen]);

  // Check if all formulas are valid (both in display config and conditions)
  const hasInvalidFormulas = useMemo(() => {
    // Check formulas in display config args
    const invalidDisplayFormulas = displayConfig.args.some((arg) => {
      if (arg.formula && arg.formula.trim() !== "") {
        const validation = validateFormula(arg.formula);
        return !validation.isValid;
      }
      return false;
    });

    // Check formulas in conditions (custom_formula conditions)
    const invalidConditionFormulas = conditions.some((condition) => {
      if (condition.operator === "custom_formula") {
        const validation = validateConditionFormula(condition.value, condition.field);
        return !validation.isValid;
      }
      return false;
    });

    return invalidDisplayFormulas || invalidConditionFormulas;
  }, [displayConfig.args, conditions]);

  // Check if conditions are valid (required fields filled, valid values)
  const hasInvalidConditions = useMemo(() => {
    // Check if all required conditions have values
    const requiredConditions = conditions.filter((c) => c.required);
    const allRequiredFilled = requiredConditions.every((condition) => condition.value.trim() !== "");
    if (!allRequiredFilled) return true;

    // Validate all conditions that have values
    const conditionsWithValues = conditions.filter((c) => c.field && c.value.trim() !== "");

    // Validate standard conditions (non-custom-formula)
    const standardConditions = conditionsWithValues.filter((c) => c.operator !== "custom_formula");
    const hasInvalidStandard = standardConditions.some((condition) => {
      const error = getConditionError(condition, eventArgs);
      return !!error;
    });
    if (hasInvalidStandard) return true;

    // Validate custom formula conditions
    const customFormulaConditions = conditionsWithValues.filter((c) => c.operator === "custom_formula");
    const hasInvalidCustomFormula = customFormulaConditions.some((condition) => {
      const validation = validateConditionFormula(condition.value, condition.field);
      return !validation.isValid;
    });

    return hasInvalidCustomFormula;
  }, [conditions, eventArgs]);

  // Can simulate if no invalid formulas, no invalid conditions, and integrations are selected
  const canSimulate = !hasInvalidFormulas && !hasInvalidConditions && selectedIntegrationIds.length > 0;

  const handleSimulate = async (blockNumber: number) => {
    if (!watcher) return;
    setIsSimulating(true);
    try {
      await simulateAlert({
        teamIntegrationIds: selectedIntegrationIds,
        blockNumber,
        eventWatcher: {
          contractAddress: watcher.eventWatcher.contract_address,
          chainId: watcher.eventWatcher.chain_id!,
          eventAbi: watcher.eventWatcher.event_abi,
          conditions: conditions.map(({ required, type, formula, ...c }) => c),
          display: displayConfig,
          label: label || watcher.eventWatcher.label,
          severity,
        },
      });
      setIsSimulateModalOpen(false);
      showSuccess("Simulation alerts have been sent");
    } catch (error: any) {
      showError(error.message || "Failed to simulate alert");
    } finally {
      setIsSimulating(false);
    }
  };

  const handleSave = async () => {
    if (!watcher || !currentTeamId) return;

    if (selectedIntegrationIds.length === 0) {
      showError("Please select at least one integration");
      return;
    }

    if (hasInvalidFormulas) {
      showError("Please fix all formula errors before saving");
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean conditions: remove fields that aren't in the Convex schema (required, type, formula)
      const cleanedConditions = conditions.map(({ required, type, formula, ...condition }) => condition);

      await updateEventWatcher({
        id: watcher.eventWatcher._id,
        label: label.trim(),
        condition: cleanedConditions,
        display: normalizeDisplayConfig(displayConfig),
        team_integration_ids: selectedIntegrationIds,
        severity: severity,
      });

      lastSavedWatcherIdRef.current = watcher.eventWatcher._id;
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      showSuccess("Alert updated successfully");
      onClose();
    } catch (error: any) {
      showError(error.data || "Failed to update alert");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (watcher) {
      setLabel(watcher.eventWatcher.label || "");
      setSeverity(watcher.eventWatcher.severity || "info");
      setConditions(watcher.eventWatcher.condition || []);

      // TODO: fix after the severity is not optional
      if (watcher.eventWatcher.display) {
        setDisplayConfig({
          ...watcher.eventWatcher.display,
          severity: watcher.eventWatcher.display.severity ?? (watcher.eventWatcher.severity ? true : false),
        });
      } else {
        setDisplayConfig(defaultDisplayConfig);
      }

      // Get team_integration_ids from watcherIntegrations
      const watcherIntegrationIds =
        watcherIntegrations
          ?.filter((wi) => wi.event_watcher_id === watcher.eventWatcher._id)
          .map((wi) => wi.team_integration_id) || [];
      setSelectedIntegrationIds(watcherIntegrationIds);
    }
    onClose();
  };

  const handleSetConditions = (newConditions: Condition[] | ((prev: Condition[]) => Condition[])) => {
    if (typeof newConditions === "function") {
      setConditions(newConditions(conditions));
    } else {
      setConditions(newConditions);
    }
  };

  if (!watcher) return null;

  const eventName = getEventName(watcher.eventWatcher.event_abi || "");
  const contractAddress = watcher.eventWatcher.contract_address || "";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="2xl">
      <ModalOverlay backgroundColor="rgba(0, 0, 0, 0.6)" backdropFilter="blur(4px)" />
      <ModalContent backgroundColor="gray.900" borderColor="gray.800" borderWidth="1px" color="white" maxW="1200px">
        <ModalHeader position="relative" paddingBottom={4}>
          <VStack alignItems="flex-start" gap={3} flex={1}>
            <Text fontSize="xl" fontWeight="bold" color="white">
              Edit Alert
            </Text>
            <VStack alignItems="flex-start" gap={3} width="100%">
              <VStack alignItems="flex-start" gap={2} width="100%">
                <HStack gap={2} alignItems="center" width="100%">
                  <Text color="gray.400" fontSize="sm" minWidth="80px">
                    Contract:
                  </Text>
                  <Text color="blue.400" fontSize="sm" fontFamily="mono" wordBreak="break-all">
                    {contractAddress}
                  </Text>
                </HStack>
                <HStack gap={2} alignItems="center" width="100%">
                  <Text color="gray.400" fontSize="sm" minWidth="80px">
                    Event:
                  </Text>
                  <Badge
                    backgroundColor="blue.500"
                    color="white"
                    paddingX={2}
                    paddingY={1}
                    borderRadius="md"
                    fontSize="xs"
                  >
                    {eventName}
                  </Badge>
                  <Text color="gray.400" fontSize="sm">
                    on {watcher.chain?.name || "Unknown"}
                  </Text>
                </HStack>
              </VStack>
              <HStack gap={4} alignItems="flex-end" width="100%">
                <FormControl width="fit-content" flexShrink={0}>
                  <FormLabel color="gray.300" marginBottom={1} fontSize="sm" display="flex" alignItems="center" gap={2}>
                    <Box backgroundColor={SEVERITY_COLORS[severity]} width="10px" height="10px" borderRadius="full" />{" "}
                    Severity
                  </FormLabel>
                  <SeverityDropdown value={severity} onChange={setSeverity} />
                </FormControl>
                <FormControl flex={1}>
                  <FormLabel color="gray.300" marginBottom={1} fontSize="sm">
                    Alert Label
                  </FormLabel>
                  <Input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g., My Alert"
                    borderColor="gray.700"
                    backgroundColor="gray.800"
                    color="white"
                    _focus={{
                      borderColor: "blue.500",
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
                    }}
                  />
                </FormControl>
              </HStack>
            </VStack>
          </VStack>
          <ModalCloseButton position="absolute" top={0} right={0} />
        </ModalHeader>
        <ModalBody>
          <Tabs colorScheme="blue" defaultIndex={0}>
            <TabList borderBottomWidth="1px" borderBottomColor="gray.700">
              <Tab color="gray.400" _selected={{ color: "white", borderColor: "blue.500" }}>
                Conditions
              </Tab>
              <Tab color="gray.400" _selected={{ color: "white", borderColor: "blue.500" }}>
                Message
              </Tab>
              <Tab color="gray.400" _selected={{ color: "white", borderColor: "blue.500" }}>
                Integrations
              </Tab>
            </TabList>

            <TabPanels>
              <Conditions
                conditions={conditions}
                setConditions={handleSetConditions}
                eventArgs={eventArgs}
                wrapper="TabPanel"
                wrapperProps={{ paddingX: 0, paddingTop: 4 }}
              />
              <Message
                displayConfig={displayConfig}
                setDisplayConfig={setDisplayConfig}
                eventArgs={eventArgs}
                wrapper="TabPanel"
                wrapperProps={{ paddingX: 0, paddingTop: 4 }}
              />
              {teamIntegrations && (
                <Integrations
                  selectedIntegrationIds={selectedIntegrationIds}
                  setSelectedIntegrationIds={setSelectedIntegrationIds}
                  teamIntegrations={teamIntegrations}
                  wrapper="TabPanel"
                  wrapperProps={{ paddingX: 0, paddingTop: 4 }}
                />
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <CustomButton variant="secondary" size="sm" onClick={handleClose}>
            Cancel
          </CustomButton>
          <HStack gap={3} marginLeft="auto">
            <CustomButton
              variant="secondary"
              size="sm"
              onClick={() => setIsSimulateModalOpen(true)}
              disabled={!canSimulate}
            >
              Simulate
            </CustomButton>
            <CustomButton
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={
                isSubmitting || selectedIntegrationIds.length === 0 || hasInvalidFormulas || hasInvalidConditions
              }
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </CustomButton>
          </HStack>
        </ModalFooter>
      </ModalContent>
      <SimulateModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onSimulate={handleSimulate}
        isSubmitting={isSimulating}
        selectedTeamIntegrationIds={selectedIntegrationIds}
      />
    </Modal>
  );
}
