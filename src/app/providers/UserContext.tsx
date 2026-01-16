"use client";

import { createContext, useContext, ReactNode, useCallback, useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuth } from "./AuthContext";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { SeverityType } from "../../../convex/data/severities";

export type Role = "owner" | "admin" | "member";
export type RoleWithoutOwner = "admin" | "member";

interface TeamWithRole extends Doc<"teams"> {
  role: Role;
}

interface TeamMemberWithUser extends Doc<"team_members"> {
  user: Doc<"users"> | null;
}

type UserWithSubscription = "Free" | "Solo" | "Team" | "Solo & Team";

interface UserContextType {
  // Data
  teamIntegrations: Doc<"team_integrations">[] | undefined;
  teamAddresses: Doc<"team_addresses">[] | undefined;
  watchers: Doc<"event_watchers">[] | undefined;
  watcherIntegrations: Doc<"watcher_integrations">[] | undefined;
  teams: TeamWithRole[] | undefined;
  currentTeamId: Id<"teams"> | null;
  isLoading: boolean;
  selectedTeam: Doc<"teams"> | undefined | null;
  teamMembers: TeamMemberWithUser[] | undefined;
  getAddedByUsername: (addedByUserId: Id<"users">) => string;
  isLimitReached: boolean;
  userSubscription: UserWithSubscription | undefined;

  // Team management
  createTeam: (args: { name: string }) => Promise<void>;
  switchTeam: (teamId: Id<"teams">) => void;
  editTeamName: (args: { id: Id<"teams">; name: string }) => Promise<void>;
  deleteTeam: (args: { id: Id<"teams"> }) => Promise<void>;
  addTeamMember: (args: {
    team_id: Id<"teams">;
    wallet_address?: string;
    email?: string;
    role: RoleWithoutOwner;
  }) => Promise<void>;
  removeTeamMember: (args: { team_id: Id<"teams">; user_id: Id<"users"> }) => Promise<void>;
  changeTeamMemberRole: (args: { team_id: Id<"teams">; user_id: Id<"users">; role: RoleWithoutOwner }) => Promise<void>;
  leaveTeam: (args: { team_id: Id<"teams"> }) => Promise<void>;

  // User management
  updateUsername: (args: { username: string }) => Promise<void>;
  deleteUser: () => Promise<void>;

  // Team Integration mutations
  createTeamIntegration: (args: {
    team_id: Id<"teams">;
    label: string;
    integration_id: string;
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
    chain_id: number;
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
    severity: SeverityType;
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
    severity: SeverityType;
  }) => Promise<void>;
  deleteEventWatcher: (args: { id: Id<"event_watchers"> }) => Promise<void>;
  activateEventWatcher: (args: { id: Id<"event_watchers"> }) => Promise<void>;
  deactivateEventWatcher: (args: { id: Id<"event_watchers"> }) => Promise<void>;
  duplicateEventWatcher: (args: { id: Id<"event_watchers"> }) => Promise<void>;
  simulateAlert: (args: {
    teamIntegrationIds: Id<"team_integrations">[];
    blockNumber: number;
    eventWatcher: {
      contractAddress: string;
      chainId: number;
      eventAbi: string;
      conditions: Array<{ field: string; operator: string; value: string }>;
      display: {
        timestamp: boolean;
        label: boolean;
        chain: boolean;
        contract_address: boolean;
        event_abi: boolean;
        explorer_link: boolean;
        layerzer_link: boolean;
        args: Array<{ key: string; label?: string; decimals?: number; formula?: string }>;
      };
      label: string;
    };
  }) => Promise<void>;
}

export const CURRENT_TEAM_STORAGE_KEY = "onchain_warden_current_team_id";

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { accessToken, currentUser, _getAccessToken } = useAuth();
  const [currentTeamId, setCurrentTeamId] = useState<Id<"teams"> | null>(null);

  useEffect(() => {
    if (!currentUser) setCurrentTeamId(null);
  }, [currentUser]);

  // Fetch teams
  const teams = useQuery(api.team.getTeamsByUserAccessToken, currentUser && accessToken ? { accessToken } : "skip") as
    | TeamWithRole[]
    | undefined;

  const userSubscription: UserWithSubscription | undefined = useMemo(() => {
    if (teams) {
      const personalTeam = teams.find((t) => t.is_personal);

      let hasSolo = false;
      let hasTeam = false;

      if ((personalTeam?.alert_limit || 0) > 5) hasSolo = true;

      const ownedTeam = teams.filter((t) => t.role === "owner" && !t.is_personal);

      if (ownedTeam.length) hasTeam = true;

      if (hasSolo && hasTeam) return "Solo & Team";
      if (hasTeam) return "Team";
      if (hasSolo) return "Solo";

      return "Free";
    }
  }, [teams]);

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

  // Check if alert limit is reached (5+ watchers and personal team)
  const isLimitReached = useMemo(() => {
    return (watchers?.length || 0) >= (selectedTeam?.alert_limit || 0);
  }, [watchers?.length, selectedTeam?.alert_limit]);

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
  const activateEventWatcherAction = useAction(api.eventWatchers.activateEventWatcher);
  const deactivateEventWatcherMutation = useMutation(api.eventWatchers.deactivateEventWatcher);
  const duplicateEventWatcherAction = useAction(api.eventWatchers.duplicateEventWatcher);

  const createTeamMutation = useMutation(api.team.createTeam);
  const editTeamNameMutation = useMutation(api.team.editTeamName);
  const deleteTeamMutation = useMutation(api.team.deleteTeam);
  const updateUserMutation = useMutation(api.users.updateUser);
  const deleteUserMutation = useMutation(api.users.deleteUser);

  const addTeamMemberMutation = useMutation(api.teamMembers.addTeamMember);
  const removeTeamMemberMutation = useMutation(api.teamMembers.removeTeamMember);
  const changeTeamMemberRoleMutation = useMutation(api.teamMembers.changeTeamMemberRole);
  const leaveTeamMutation = useMutation(api.teamMembers.leaveTeam);

  // Wrapper functions that handle access token internally
  const createTeamIntegration = useCallback(
    async (args: { team_id: Id<"teams">; label: string; integration_id: string; data: Record<string, string> }) => {
      await createTeamIntegrationAction({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, createTeamIntegrationAction],
  );

  const updateTeamIntegration = useCallback(
    async (args: { id: Id<"team_integrations">; label: string; data: Record<string, string> }) => {
      await updateTeamIntegrationAction({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, updateTeamIntegrationAction],
  );

  const deleteTeamIntegration = useCallback(
    async (args: { id: Id<"team_integrations"> }) => {
      await deleteTeamIntegrationMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, deleteTeamIntegrationMutation],
  );

  const createTeamAddress = useCallback(
    async (args: { team_id: Id<"teams">; label: string; address: string }) => {
      return await createTeamAddressMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, createTeamAddressMutation],
  );

  const updateTeamAddress = useCallback(
    async (args: { id: Id<"team_addresses">; label: string; address: string }) => {
      await updateTeamAddressMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, updateTeamAddressMutation],
  );

  const deleteTeamAddress = useCallback(
    async (args: { id: Id<"team_addresses"> }) => {
      await deleteTeamAddressMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, deleteTeamAddressMutation],
  );

  const createEventWatcher = useCallback(
    async (args: {
      team_id: Id<"teams">;
      label: string;
      chain_id: number;
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
      severity: SeverityType;
    }) => {
      await createEventWatcherAction({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, createEventWatcherAction],
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
      severity: SeverityType;
    }) => {
      await updateEventWatcherMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, updateEventWatcherMutation],
  );

  const deleteEventWatcher = useCallback(
    async (args: { id: Id<"event_watchers"> }) => {
      await deleteEventWatcherMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, deleteEventWatcherMutation],
  );

  const activateEventWatcher = useCallback(
    async (args: { id: Id<"event_watchers"> }) => {
      await activateEventWatcherAction({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, activateEventWatcherAction],
  );

  const deactivateEventWatcher = useCallback(
    async (args: { id: Id<"event_watchers"> }) => {
      await deactivateEventWatcherMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, deactivateEventWatcherMutation],
  );

  const duplicateEventWatcher = useCallback(
    async (args: { id: Id<"event_watchers"> }) => {
      await duplicateEventWatcherAction({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, duplicateEventWatcherAction],
  );

  const simulateAlertAction = useAction(api.eventWatchers.simulateAlert);
  const simulateAlert = useCallback(
    async (args: {
      teamIntegrationIds: Id<"team_integrations">[];
      blockNumber: number;
      eventWatcher: {
        contractAddress: string;
        chainId: number;
        eventAbi: string;
        conditions: Array<{ field: string; operator: string; value: string }>;
        display: {
          timestamp: boolean;
          label: boolean;
          chain: boolean;
          contract_address: boolean;
          event_abi: boolean;
          explorer_link: boolean;
          layerzer_link: boolean;
          args: Array<{ key: string; label?: string; decimals?: number; formula?: string }>;
        };
        label: string;
      };
    }) => {
      try {
        await simulateAlertAction({
          teamIntegrationIds: args.teamIntegrationIds,
          blockNumber: args.blockNumber,
          ...args.eventWatcher,
          accessToken: await _getAccessToken(),
        });
      } catch (error: any) {
        throw new Error(error.data || "Failed to simulate alert");
      }
    },
    [_getAccessToken, simulateAlertAction],
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
        accessToken: await _getAccessToken(),
      });
      // Switch to the newly created team
      if (teamId) {
        switchTeam(teamId);
      }
    },
    [_getAccessToken, createTeamMutation, switchTeam],
  );

  const editTeamName = useCallback(
    async (args: { id: Id<"teams">; name: string }) => {
      await editTeamNameMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, editTeamNameMutation],
  );

  const deleteTeam = useCallback(
    async (args: { id: Id<"teams"> }) => {
      await deleteTeamMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
      // If the deleted team was the current team, switch to the first available team
      if (args.id === currentTeamId && teams && teams.length > 1) {
        const remainingTeams = teams.filter((t) => t._id !== args.id);
        if (remainingTeams.length > 0) {
          switchTeam(remainingTeams[0]._id);
        }
      }
    },
    [_getAccessToken, deleteTeamMutation, currentTeamId, teams, switchTeam],
  );

  const updateUsername = useCallback(
    async (args: { username: string }) => {
      await updateUserMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, updateUserMutation],
  );

  const deleteUser = useCallback(async () => {
    await deleteUserMutation({
      accessToken: await _getAccessToken(),
    });
  }, [_getAccessToken, deleteUserMutation]);

  const addTeamMember = useCallback(
    async (args: { team_id: Id<"teams">; wallet_address?: string; email?: string; role: RoleWithoutOwner }) => {
      await addTeamMemberMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, addTeamMemberMutation],
  );

  const removeTeamMember = useCallback(
    async (args: { team_id: Id<"teams">; user_id: Id<"users"> }) => {
      await removeTeamMemberMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, removeTeamMemberMutation],
  );

  const changeTeamMemberRole = useCallback(
    async (args: { team_id: Id<"teams">; user_id: Id<"users">; role: RoleWithoutOwner }) => {
      await changeTeamMemberRoleMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, changeTeamMemberRoleMutation],
  );

  const leaveTeam = useCallback(
    async (args: { team_id: Id<"teams"> }) => {
      await leaveTeamMutation({
        ...args,
        accessToken: await _getAccessToken(),
      });
    },
    [_getAccessToken, leaveTeamMutation],
  );

  const isLoading = Boolean(
    (currentTeamId && teamIntegrations === undefined) ||
    (currentTeamId && teamAddresses === undefined) ||
    (currentTeamId && watchers === undefined) ||
    (accessToken && currentUser === undefined) ||
    (accessToken && teams === undefined),
  );

  return (
    <UserContext.Provider
      value={{
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
        isLimitReached,
        userSubscription,
        createTeamIntegration,
        updateTeamIntegration,
        deleteTeamIntegration,
        createTeamAddress,
        updateTeamAddress,
        deleteTeamAddress,
        createEventWatcher,
        updateEventWatcher,
        deleteEventWatcher,
        activateEventWatcher,
        deactivateEventWatcher,
        duplicateEventWatcher,
        simulateAlert,
        createTeam,
        switchTeam,
        editTeamName,
        deleteTeam,
        updateUsername,
        deleteUser,
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
