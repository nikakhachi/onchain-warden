import { action, ActionCtx, internalMutation, internalQuery, mutation, MutationCtx, query } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { sendTestTelegramMessage } from "./integrations/telegram";
import { sendTestDiscordMessage } from "./integrations/discord";
import { sendTestSlackMessage } from "./integrations/slack";
import { _mustBeTeamMember } from "./auth";
import { ERROR_MESSAGES } from "./errors/errorMessages";
import { IntegrationData } from "../src/app/shared/enums";
import { Id } from "./_generated/dataModel";
import { INTEGRATIONS } from "./data/integrations";

export const getAllTeamIntegrations = internalQuery({
  handler: async (ctx) => ctx.db.query("team_integrations").collect(),
});

export const getTeamIntegrationById = internalQuery({
  args: { id: v.id("team_integrations") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getTeamIntegrationsByTeamId = query({
  args: { team_id: v.id("teams"), accessToken: v.string() },
  handler: async (ctx, args) => {
    await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    return await ctx.db
      .query("team_integrations")
      .withIndex("by_team_id", (q) => q.eq("team_id", args.team_id))
      .collect();
  },
});

export const createTeamIntegrationAction = action({
  args: {
    team_id: v.id("teams"),
    label: v.string(),
    integration_id: v.string(),
    data: v.any(),
    accessToken: v.string(),
  },
  handler: async (ctx, args) => {
    const { user } = await _mustBeTeamMember(ctx, args.team_id, args.accessToken);

    const integration = INTEGRATIONS[args.integration_id];

    if (!integration) throw new ConvexError(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);

    _checkRequiredData(args.data, integration.required_data);

    if (integration.name === "Telegram") {
      await sendTestTelegramMessage(Number(args.data[IntegrationData.TELEGRAM]));
    } else if (integration.name === "Discord") {
      await sendTestDiscordMessage(args.data[IntegrationData.DISCORD]);
    } else if (integration.name === "Slack") {
      await sendTestSlackMessage(args.data[IntegrationData.SLACK]);
    }

    await ctx.runMutation(internal.teamIntegrations.createTeamIntegrationMutation, {
      label: args.label,
      integration_id: args.integration_id,
      data: args.data,
      team_id: args.team_id,
      added_by: user._id,
    });
  },
});

export const createTeamIntegrationMutation = internalMutation({
  args: {
    label: v.string(),
    integration_id: v.string(),
    data: v.any(),
    team_id: v.id("teams"),
    added_by: v.id("users"),
  },
  handler: async (ctx, args) => ctx.db.insert("team_integrations", args),
});

export const updateTeamIntegrationAction = action({
  args: {
    id: v.id("team_integrations"),
    label: v.string(),
    data: v.any(),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    const existingTeamIntegration = await _mustBeTeamMemberOfTheTeamIntegration(ctx, args.id, args.accessToken);

    const integration = INTEGRATIONS[existingTeamIntegration.integration_id];

    if (!integration) throw new ConvexError(ERROR_MESSAGES.INTEGRATION_NOT_FOUND);

    _checkRequiredData(args.data, integration.required_data);

    if (
      integration.name === "Telegram" &&
      existingTeamIntegration.data[IntegrationData.TELEGRAM] !== args.data[IntegrationData.TELEGRAM]
    ) {
      await sendTestTelegramMessage(Number(args.data[IntegrationData.TELEGRAM]));
    } else if (
      integration.name === "Discord" &&
      existingTeamIntegration.data[IntegrationData.DISCORD] !== args.data[IntegrationData.DISCORD]
    ) {
      await sendTestDiscordMessage(args.data[IntegrationData.DISCORD]);
    } else if (
      integration.name === "Slack" &&
      existingTeamIntegration.data[IntegrationData.SLACK] !== args.data[IntegrationData.SLACK]
    ) {
      await sendTestSlackMessage(args.data[IntegrationData.SLACK]);
    }

    await ctx.runMutation(internal.teamIntegrations.updateTeamIntegrationMutation, {
      id: args.id,
      label: args.label,
      data: args.data,
    });
  },
});

export const updateTeamIntegrationMutation = internalMutation({
  args: {
    id: v.id("team_integrations"),
    label: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => ctx.db.patch(args.id, { label: args.label, data: args.data }),
});

export const deleteTeamIntegration = mutation({
  args: {
    id: v.id("team_integrations"),
    accessToken: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    await _mustBeTeamMemberOfTheTeamIntegration(ctx, args.id, args.accessToken);

    const watcherIntegrations = await ctx.runQuery(
      internal.watcherIntegrations.getWatcherIntegrationsByTeamIntegrationId,
      { team_integration_id: args.id },
    );

    await Promise.all(
      watcherIntegrations.map((watcherIntegration) =>
        ctx.runMutation(internal.watcherIntegrations.deleteWatcherIntegrationInternal, {
          id: watcherIntegration._id,
        }),
      ),
    );

    await ctx.db.delete(args.id);
  },
});

const _mustBeTeamMemberOfTheTeamIntegration = async (
  ctx: ActionCtx | MutationCtx,
  team_integration_id: Id<"team_integrations">,
  access_token: string,
) => {
  const existingTeamIntegration = await ctx.runQuery(internal.teamIntegrations.getTeamIntegrationById, {
    id: team_integration_id,
  });
  if (!existingTeamIntegration) throw new ConvexError(ERROR_MESSAGES.TEAM_INTEGRATION_NOT_FOUND);

  await _mustBeTeamMember(ctx, existingTeamIntegration.team_id, access_token);

  return existingTeamIntegration;
};

const _checkRequiredData = (data: Record<string, any>, requiredData: string[]) => {
  // Make sure data has all the required fields by the integration
  // Nothing more, nothing less

  if (Object.keys(data).length !== requiredData.length) throw new ConvexError(ERROR_MESSAGES.INVALID_DATA);

  for (const requiredField of requiredData) {
    if (!data[requiredField]) throw new ConvexError(ERROR_MESSAGES.REQUIRED_FIELD_MISSING(requiredField));
  }
};
