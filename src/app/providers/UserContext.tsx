"use client";

import { createContext, useContext, ReactNode, useCallback, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { TOKEN_STORAGE_KEY, useWallet } from "./WalletContext";
import { Doc, Id } from "../../../convex/_generated/dataModel";

interface TeamMemberWithUser extends Doc<"team_members"> {
  user: Doc<"users"> | null;
}

interface UserContextType {
  // Data
  chains: Doc<"chains">[] | undefined;
  integrations: Doc<"integrations">[] | undefined;
  teamIntegrations: Doc<"team_integrations">[] | undefined;
  teamAddresses: Doc<"team_addresses">[] | undefined;
  watchers: Doc<"event_watchers">[] | undefined;
  watcherIntegrations: Doc<"watcher_integrations">[] | undefined;
  teams: Doc<"teams">[] | undefined;
  currentTeamId: Id<"teams"> | null;
  isLoading: boolean;
  selectedTeam: Doc<"teams"> | undefined | null;
  teamMembers: TeamMemberWithUser[] | undefined;
  getAddedByUsername: (addedByUserId: Id<"users">) => string;

  // Team management
  createTeam: (args: { name: string }) => Promise<void>;
  switchTeam: (teamId: Id<"teams">) => void;
  editTeamName: (args: { id: Id<"teams">; name: string }) => Promise<void>;
  deleteTeam: (args: { id: Id<"teams"> }) => Promise<void>;
  addTeamMember: (args: { team_id: Id<"teams">; wallet_address: string; role: "member" | "admin" }) => Promise<void>;
  removeTeamMember: (args: { team_id: Id<"teams">; user_id: Id<"users"> }) => Promise<void>;
  changeTeamMemberRole: (args: {
    team_id: Id<"teams">;
    user_id: Id<"users">;
    role: "member" | "admin";
  }) => Promise<void>;
  leaveTeam: (args: { team_id: Id<"teams"> }) => Promise<void>;

  // User management
  updateUsername: (args: { username: string }) => Promise<void>;

  // Team Integration mutations
  createTeamIntegration: (args: {
    team_id: Id<"teams">;
    label: string;
    integration_id: Id<"integrations">;
    data: Record<string, string>;
  }) => Promise<void>;
  updateTeamIntegration: (args: {
    id: Id<"team_integrations">;
    label: string;
    data: Record<string, string>;
  }) => Promise<void>;
  deleteTeamIntegration: (args: { id: Id<"team_integrations"> }) => Promise<void>;

  // Team Address mutations
  createTeamAddress: (args: { team_id: Id<"teams">; label: string; address: string }) => Promise<Id<"team_addresses">>;
  updateTeamAddress: (args: { id: Id<"team_addresses">; label: string; address: string }) => Promise<void>;
  deleteTeamAddress: (args: { id: Id<"team_addresses"> }) => Promise<void>;

  // Event Watcher mutations/actions
  createEventWatcher: (args: {
    team_id: Id<"teams">;
    label: string;
    chain_convex_id: Id<"chains">;
    contract_address: string;
    event_abi: string;
    team_integration_ids: Id<"team_integrations">[];
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
    team_integration_ids: Id<"team_integrations">[];
  }) => Promise<void>;
  deleteEventWatcher: (args: { id: Id<"event_watchers"> }) => Promise<void>;
}

export const CURRENT_TEAM_STORAGE_KEY = "onchain_warden_current_team_id";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { currentAccount, accessToken, currentUser } = useWallet();
  const [currentTeamId, setCurrentTeamId] = useState<Id<"teams"> | null>(null);

  // Fetch all integrations (global, not user-specific)
  const integrations = useQuery(api.integrations.getIntegrations);
  const chains = useQuery(api.chains.getChains);

  // Get access token from localStorage

  useEffect(() => {
    if (!currentAccount || !currentUser) {
      setCurrentTeamId(null);
    }
  }, [currentAccount, currentUser]);

  // Fetch teams
  const teams = useQuery(api.team.getTeamsByUserAccessToken, currentUser && accessToken ? { accessToken } : "skip") as
    | Doc<"teams">[]
    | undefined;

  const selectedTeam = useMemo(() => {
    if (!currentTeamId || !teams) return null;
    return teams.find((t) => t._id === currentTeamId);
  }, [currentTeamId, teams]);

  const teamMembers = useQuery(
    api.teamMembers.getTeamMembersByTeamId,
    currentTeamId && accessToken ? { team_id: currentTeamId, accessToken } : "skip",
  );

  const getAddedByUsername = useCallback(
    (addedByUserId: Id<"users">) => {
      const member = teamMembers?.find((m) => m.user_id === addedByUserId);
      return member?.user?.username || "Unknown";
    },
    [teamMembers],
  );

  // Load current team from localStorage on mount and when teams change
  useEffect(() => {
    if (typeof window === "undefined" || !teams || teams.length === 0) return;

    const storedTeamId = localStorage.getItem(CURRENT_TEAM_STORAGE_KEY);
    if (storedTeamId) {
      const teamExists = teams.some((t) => t._id === storedTeamId);
      if (teamExists) {
        setCurrentTeamId(storedTeamId as Id<"teams">);
        return;
      }
    }

    // If no stored team or stored team doesn't exist, use first team
    if (teams.length > 0) {
      setCurrentTeamId(teams[0]._id);
      localStorage.setItem(CURRENT_TEAM_STORAGE_KEY, teams[0]._id);
    }
  }, [teams]);

  // Fetch team-specific data when currentTeamId is available
  const teamIntegrations = useQuery(
    api.teamIntegrations.getTeamIntegrationsByTeamId,
    currentTeamId && accessToken ? { team_id: currentTeamId, accessToken } : "skip",
  ) as Doc<"team_integrations">[] | undefined;

  const teamAddresses = useQuery(
    api.teamAddresses.getTeamAddressesByTeamId,
    currentTeamId && accessToken ? { team_id: currentTeamId, accessToken } : "skip",
  ) as Doc<"team_addresses">[] | undefined;

  const watchers = useQuery(
    api.eventWatchers.getEventWatchersByTeamId,
    currentTeamId ? { team_id: currentTeamId } : "skip",
  ) as Doc<"event_watchers">[] | undefined;

  const watcherIntegrations = useQuery(
    api.watcherIntegrations.getWatcherIntegrationsByTeamId,
    currentTeamId && accessToken ? { team_id: currentTeamId, accessToken } : "skip",
  ) as Doc<"watcher_integrations">[] | undefined;

  // Mutations and Actions
  const createTeamIntegrationAction = useAction(api.teamIntegrations.createTeamIntegrationAction);
  const updateTeamIntegrationAction = useAction(api.teamIntegrations.updateTeamIntegrationAction);
  const deleteTeamIntegrationMutation = useMutation(api.teamIntegrations.deleteTeamIntegration);

  const createTeamAddressMutation = useMutation(api.teamAddresses.createTeamAddress);
  const updateTeamAddressMutation = useMutation(api.teamAddresses.updateTeamAddress);
  const deleteTeamAddressMutation = useMutation(api.teamAddresses.deleteTeamAddress);

  const createEventWatcherAction = useAction(api.eventWatchers.createEventWatcherAction);
  const updateEventWatcherMutation = useMutation(api.eventWatchers.updateEventWatcher);
  const deleteEventWatcherMutation = useMutation(api.eventWatchers.deleteEventWatcher);

  const createTeamMutation = useMutation(api.team.createTeam);
  const editTeamNameMutation = useMutation(api.team.editTeamName);
  const deleteTeamMutation = useMutation(api.team.deleteTeam);
  const updateUserMutation = useMutation(api.users.updateUser);

  const addTeamMemberMutation = useMutation(api.teamMembers.addTeamMember);
  const removeTeamMemberMutation = useMutation(api.teamMembers.removeTeamMember);
  const changeTeamMemberRoleMutation = useMutation(api.teamMembers.changeTeamMemberRole);
  const leaveTeamMutation = useMutation(api.teamMembers.leaveTeam);

  const _accessToken = useCallback(async () => {
    if (!currentAccount || !currentUser) {
      throw new Error("Wallet not connected or not authenticated");
    }
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!token) {
      throw new Error("No access token found. Please sign in.");
    }

    return token;
  }, [currentAccount, currentUser]);

  // Wrapper functions that handle access token internally
  const createTeamIntegration = useCallback(
    async (args: {
      team_id: Id<"teams">;
      label: string;
      integration_id: Id<"integrations">;
      data: Record<string, string>;
    }) => {
      await createTeamIntegrationAction({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, createTeamIntegrationAction],
  );

  const updateTeamIntegration = useCallback(
    async (args: { id: Id<"team_integrations">; label: string; data: Record<string, string> }) => {
      await updateTeamIntegrationAction({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateTeamIntegrationAction],
  );

  const deleteTeamIntegration = useCallback(
    async (args: { id: Id<"team_integrations"> }) => {
      await deleteTeamIntegrationMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, deleteTeamIntegrationMutation],
  );

  const createTeamAddress = useCallback(
    async (args: { team_id: Id<"teams">; label: string; address: string }) => {
      return await createTeamAddressMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, createTeamAddressMutation],
  );

  const updateTeamAddress = useCallback(
    async (args: { id: Id<"team_addresses">; label: string; address: string }) => {
      await updateTeamAddressMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateTeamAddressMutation],
  );

  const deleteTeamAddress = useCallback(
    async (args: { id: Id<"team_addresses"> }) => {
      await deleteTeamAddressMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, deleteTeamAddressMutation],
  );

  const createEventWatcher = useCallback(
    async (args: {
      team_id: Id<"teams">;
      label: string;
      chain_convex_id: Id<"chains">;
      contract_address: string;
      event_abi: string;
      team_integration_ids: Id<"team_integrations">[];
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
    [_accessToken, createEventWatcherAction],
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
      team_integration_ids: Id<"team_integrations">[];
    }) => {
      await updateEventWatcherMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateEventWatcherMutation],
  );

  const deleteEventWatcher = useCallback(
    async (args: { id: Id<"event_watchers"> }) => {
      await deleteEventWatcherMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, deleteEventWatcherMutation],
  );

  const switchTeam = useCallback((teamId: Id<"teams">) => {
    setCurrentTeamId(teamId);
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENT_TEAM_STORAGE_KEY, teamId);
    }
  }, []);

  const createTeam = useCallback(
    async (args: { name: string }) => {
      const teamId = await createTeamMutation({
        ...args,
        accessToken: await _accessToken(),
      });
      // Switch to the newly created team
      if (teamId) {
        switchTeam(teamId);
      }
    },
    [_accessToken, createTeamMutation, switchTeam],
  );

  const editTeamName = useCallback(
    async (args: { id: Id<"teams">; name: string }) => {
      await editTeamNameMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, editTeamNameMutation],
  );

  const deleteTeam = useCallback(
    async (args: { id: Id<"teams"> }) => {
      await deleteTeamMutation({
        ...args,
        accessToken: await _accessToken(),
      });
      // If the deleted team was the current team, switch to the first available team
      if (args.id === currentTeamId && teams && teams.length > 1) {
        const remainingTeams = teams.filter((t) => t._id !== args.id);
        if (remainingTeams.length > 0) {
          switchTeam(remainingTeams[0]._id);
        }
      }
    },
    [_accessToken, deleteTeamMutation, currentTeamId, teams, switchTeam],
  );

  const updateUsername = useCallback(
    async (args: { username: string }) => {
      await updateUserMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, updateUserMutation],
  );

  const addTeamMember = useCallback(
    async (args: { team_id: Id<"teams">; wallet_address: string; role: "member" | "admin" }) => {
      await addTeamMemberMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, addTeamMemberMutation],
  );

  const removeTeamMember = useCallback(
    async (args: { team_id: Id<"teams">; user_id: Id<"users"> }) => {
      await removeTeamMemberMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, removeTeamMemberMutation],
  );

  const changeTeamMemberRole = useCallback(
    async (args: { team_id: Id<"teams">; user_id: Id<"users">; role: "member" | "admin" }) => {
      await changeTeamMemberRoleMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, changeTeamMemberRoleMutation],
  );

  const leaveTeam = useCallback(
    async (args: { team_id: Id<"teams"> }) => {
      await leaveTeamMutation({
        ...args,
        accessToken: await _accessToken(),
      });
    },
    [_accessToken, leaveTeamMutation],
  );

  const isLoading =
    (currentTeamId && teamIntegrations === undefined) ||
    (currentTeamId && teamAddresses === undefined) ||
    (currentTeamId && watchers === undefined) ||
    (accessToken && currentUser === undefined) ||
    (accessToken && teams === undefined) ||
    integrations === undefined;

  return (
    <UserContext.Provider
      value={{
        chains,
        integrations,
        teamIntegrations,
        teamAddresses,
        watchers,
        watcherIntegrations,
        teams,
        selectedTeam,
        teamMembers,
        getAddedByUsername,
        currentTeamId,
        isLoading,
        createTeamIntegration,
        updateTeamIntegration,
        deleteTeamIntegration,
        createTeamAddress,
        updateTeamAddress,
        deleteTeamAddress,
        createEventWatcher,
        updateEventWatcher,
        deleteEventWatcher,
        createTeam,
        switchTeam,
        editTeamName,
        deleteTeam,
        updateUsername,
        addTeamMember,
        removeTeamMember,
        changeTeamMemberRole,
        leaveTeam,
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
