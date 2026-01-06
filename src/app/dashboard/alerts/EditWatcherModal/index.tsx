"use client";

import { useState, useEffect, useRef } from "react";
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
import { normalizeDisplayConfig, getEventName, parseEventArgs } from "@/app/shared/helpers";
import { validateFormula } from "../../../../../convex/helpers/formulaUtils";
import { useMemo } from "react";
import { Conditions } from "../../components/AlertManagement/Conditions";
import { Condition, DisplayConfig } from "@/app/shared/types";
import { Message } from "../../components/AlertManagement/Message";
import { Integrations } from "../../components/AlertManagement/Integrations";

interface EditWatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  watcher: {
    eventWatcher: Doc<"event_watchers">;
    chain: { name: string } | null;
  } | null;
}

export function EditWatcherModal({ isOpen, onClose, watcher }: EditWatcherModalProps) {
  const { updateEventWatcher, currentTeamId, watcherIntegrations, teamIntegrations, integrations } = useUser();
  const { error: showError, success: showSuccess } = useToast();

  const [label, setLabel] = useState("");
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
  };

  useEffect(() => {
    if (
      watcher &&
      watcher.eventWatcher._id !== initializedWatcherIdRef.current &&
      watcher.eventWatcher._id !== lastSavedWatcherIdRef.current
    ) {
      initializedWatcherIdRef.current = watcher.eventWatcher._id;
      setLabel(watcher.eventWatcher.label || "");
      setConditions(watcher.eventWatcher.condition || []);
      setDisplayConfig(watcher.eventWatcher.display || defaultDisplayConfig);

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

  // Check if all formulas are valid
  const hasInvalidFormulas = useMemo(() => {
    return displayConfig.args.some((arg) => {
      if (arg.formula && arg.formula.trim() !== "") {
        const validation = validateFormula(arg.formula);
        return !validation.isValid;
      }
      return false;
    });
  }, [displayConfig.args]);

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
      await updateEventWatcher({
        id: watcher.eventWatcher._id,
        label: label.trim(),
        condition: conditions,
        display: normalizeDisplayConfig(displayConfig),
        team_integration_ids: selectedIntegrationIds,
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
      setConditions(watcher.eventWatcher.condition || []);
      setDisplayConfig(watcher.eventWatcher.display || defaultDisplayConfig);

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
              <FormControl width="100%">
                <FormLabel color="gray.300" marginBottom={2} fontSize="sm">
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
              {integrations && teamIntegrations && (
              <Integrations
                selectedIntegrationIds={selectedIntegrationIds}
                setSelectedIntegrationIds={setSelectedIntegrationIds}
                  teamIntegrations={teamIntegrations}
                  integrations={integrations}
                  wrapper="TabPanel"
                  wrapperProps={{ paddingX: 0, paddingTop: 4 }}
              />
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <CustomButton variant="secondary" size="sm" onClick={handleClose} marginRight={3}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSubmitting || selectedIntegrationIds.length === 0 || hasInvalidFormulas}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </CustomButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
