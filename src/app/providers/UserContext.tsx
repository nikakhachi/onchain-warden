"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useWallet } from "./WalletContext";
import { Id } from "../../../convex/_generated/dataModel";

interface OwnerIntegration {
  _id: Id<"owner_integrations">;
  label: string;
  integration_id: Id<"integrations">;
  data: any;
  owner: string;
}

interface OwnerAddress {
  _id: Id<"owner_addresses">;
  label: string;
  address: string;
  owner: string;
}

interface Integration {
  _id: Id<"integrations">;
  name: string;
  required_data: string[];
}

interface Watcher {
  eventWatcher: any;
  integrations_data: Array<{
    ownerIntegration: OwnerIntegration;
    integration: Integration;
  }>;
  chain: any;
}

interface UserContextType {
  // Data
  integrations: Integration[] | undefined;
  ownerIntegrations: OwnerIntegration[] | undefined;
  ownerAddresses: OwnerAddress[] | undefined;
  watchers: Watcher[] | undefined;
  isLoading: boolean;

  // Owner Integration mutations
  createOwnerIntegration: (args: {
    label: string;
    integration_id: Id<"integrations">;
    data: Record<string, string>;
  }) => Promise<void>;
  updateOwnerIntegration: (args: {
    id: Id<"owner_integrations">;
    label: string;
    data: Record<string, string>;
  }) => Promise<void>;
  deleteOwnerIntegration: (args: {
    id: Id<"owner_integrations">;
  }) => Promise<void>;

  // Owner Address mutations
  createOwnerAddress: (args: {
    label: string;
    address: string;
  }) => Promise<Id<"owner_addresses">>;
  updateOwnerAddress: (args: {
    id: Id<"owner_addresses">;
    label: string;
    address: string;
  }) => Promise<void>;
  deleteOwnerAddress: (args: { id: Id<"owner_addresses"> }) => Promise<void>;

  // Event Watcher mutations/actions
  createEventWatcher: (args: {
    label: string;
    chain_convex_id: Id<"chains">;
    contract_address: string;
    event_abi: string;
    owner_integration_ids: Id<"owner_integrations">[];
    condition: Array<{ field: string; operator: string; value: string }>;
    display: {
      timestamp: boolean;
      label: boolean;
      chain: boolean;
      contract_address: boolean;
      event_abi: boolean;
      explorer_link: boolean;
      layerzer_link: boolean;
      args: Array<{ key: string; label?: string; decimals?: number }>;
    };
  }) => Promise<void>;
  updateEventWatcher: (args: {
    id: Id<"event_watchers">;
    label: string;
    condition: Array<{ field: string; operator: string; value: string }>;
    display: {
      timestamp: boolean;
      label: boolean;
      chain: boolean;
      contract_address: boolean;
      event_abi: boolean;
      explorer_link: boolean;
      layerzer_link: boolean;
      args: Array<{ key: string; label?: string; decimals?: number }>;
    };
    owner_integration_ids: Id<"owner_integrations">[];
  }) => Promise<void>;
  deleteEventWatcher: (args: { id: Id<"event_watchers"> }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { currentAccount, getAccessTokenOrAuthenticate } = useWallet();

  // Fetch all integrations (global, not user-specific)
  const integrations = useQuery(api.integrations.getIntegrations);

  // Fetch user-specific data only when currentAccount is present
  const ownerIntegrations = useQuery(
    api.ownerIntegrations.getOwnerIntegrationsByOwner,
    currentAccount ? { owner: currentAccount } : "skip"
  );

  const ownerAddresses = useQuery(
    api.ownerAddresses.getOwnerAddressessByOwner,
    currentAccount ? { owner: currentAccount } : "skip"
  );

  const watchers = useQuery(
    api.user.getUsersEventWatchers,
    currentAccount ? { wallet_address: currentAccount } : "skip"
  );

  // Mutations and Actions
  const createOwnerIntegrationMutation = useMutation(
    api.ownerIntegrations.createOwnerIntegration
  );
  const updateOwnerIntegrationMutation = useMutation(
    api.ownerIntegrations.updateOwnerIntegration
  );
  const deleteOwnerIntegrationMutation = useMutation(
    api.ownerIntegrations.deleteOwnerIntegration
  );

  const createOwnerAddressMutation = useMutation(
    api.ownerAddresses.createOwnerAddress
  );
  const updateOwnerAddressMutation = useMutation(
    api.ownerAddresses.updateOwnerAddress
  );
  const deleteOwnerAddressMutation = useMutation(
    api.ownerAddresses.deleteOwnerAddress
  );

  const createEventWatcherAction = useAction(
    api.eventWatchers.createEventWatcherAction
  );
  const updateEventWatcherMutation = useMutation(
    api.eventWatchers.updateEventWatcher
  );
  const deleteEventWatcherMutation = useMutation(
    api.eventWatchers.deleteEventWatcher
  );

  const _accessToken = useCallback(async () => {
    if (!currentAccount) {
      throw new Error("Wallet not connected");
    }
    const accessToken = await getAccessTokenOrAuthenticate();
    if (!accessToken) {
      throw new Error("Failed to authenticate. Please try again.");
    }

    return accessToken;
  }, [currentAccount, getAccessTokenOrAuthenticate]);

  // Wrapper functions that handle access token internally
  const createOwnerIntegration = useCallback(
    async (args: {
      label: string;
      integration_id: Id<"integrations">;
      data: Record<string, string>;
    }) => {
      await createOwnerIntegrationMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, createOwnerIntegrationMutation]
  );

  const updateOwnerIntegration = useCallback(
    async (args: {
      id: Id<"owner_integrations">;
      label: string;
      data: Record<string, string>;
    }) => {
      await updateOwnerIntegrationMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateOwnerIntegrationMutation]
  );

  const deleteOwnerIntegration = useCallback(
    async (args: { id: Id<"owner_integrations"> }) => {
      await deleteOwnerIntegrationMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, deleteOwnerIntegrationMutation]
  );

  const createOwnerAddress = useCallback(
    async (args: { label: string; address: string }) => {
      return await createOwnerAddressMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, createOwnerAddressMutation]
  );

  const updateOwnerAddress = useCallback(
    async (args: {
      id: Id<"owner_addresses">;
      label: string;
      address: string;
    }) => {
      await updateOwnerAddressMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateOwnerAddressMutation]
  );

  const deleteOwnerAddress = useCallback(
    async (args: { id: Id<"owner_addresses"> }) => {
      await deleteOwnerAddressMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, deleteOwnerAddressMutation]
  );

  const createEventWatcher = useCallback(
    async (args: {
      label: string;
      chain_convex_id: Id<"chains">;
      contract_address: string;
      event_abi: string;
      owner_integration_ids: Id<"owner_integrations">[];
      condition: Array<{ field: string; operator: string; value: string }>;
      display: {
        timestamp: boolean;
        label: boolean;
        chain: boolean;
        contract_address: boolean;
        event_abi: boolean;
        explorer_link: boolean;
        layerzer_link: boolean;
        args: Array<{ key: string; label?: string; decimals?: number }>;
      };
    }) => {
      await createEventWatcherAction({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, createEventWatcherAction]
  );

  const updateEventWatcher = useCallback(
    async (args: {
      id: Id<"event_watchers">;
      label: string;
      condition: Array<{ field: string; operator: string; value: string }>;
      display: {
        timestamp: boolean;
        label: boolean;
        chain: boolean;
        contract_address: boolean;
        event_abi: boolean;
        explorer_link: boolean;
        layerzer_link: boolean;
        args: Array<{ key: string; label?: string; decimals?: number }>;
      };
      owner_integration_ids: Id<"owner_integrations">[];
    }) => {
      await updateEventWatcherMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateEventWatcherMutation]
  );

  const deleteEventWatcher = useCallback(
    async (args: { id: Id<"event_watchers"> }) => {
      await deleteEventWatcherMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, deleteEventWatcherMutation]
  );

  const isLoading =
    (currentAccount && ownerIntegrations === undefined) ||
    (currentAccount && ownerAddresses === undefined) ||
    (currentAccount && watchers === undefined) ||
    integrations === undefined;

  return (
    <UserContext.Provider
      value={{
        integrations,
        ownerIntegrations,
        ownerAddresses,
        watchers,
        isLoading,
        createOwnerIntegration,
        updateOwnerIntegration,
        deleteOwnerIntegration,
        createOwnerAddress,
        updateOwnerAddress,
        deleteOwnerAddress,
        createEventWatcher,
        updateEventWatcher,
        deleteEventWatcher,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
