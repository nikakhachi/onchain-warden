export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_SIGNATURE: "Invalid signature",
  SIGNATURE_EXPIRED: "Signature expired",
  INVALID_TOKEN: "Invalid token",
  TOKEN_EXPIRED: "Token expired",

  // User errors
  USER_ALREADY_EXISTS: "User already exists. Please sign in",
  USER_NOT_FOUND: "User not found. Please sign up",

  // Team errors
  TEAM_NOT_FOUND: "Team not found",
  NEW_OWNER_NOT_FOUND: "New Owner not found",
  CANNOT_DELETE_LAST_TEAM: "Cannot delete the last team",
  NOT_THE_OWNER: "Not the Owner",
  NOT_A_MEMBER: "Not a member",
  NOT_AN_ADMIN: "Not an admin",

  // Team member errors
  USER_ALREADY_MEMBER: "User is already a member of this team",
  CANNOT_REMOVE_TEAM_OWNER: "Cannot remove team owner",
  MEMBER_NOT_FOUND: "Member not found",
  CANNOT_CHANGE_OWNER_ROLE: "Cannot change owner role",

  // Event watcher errors
  CHAIN_NOT_FOUND: "Chain not found",
  TEAM_INTEGRATION_IDS_EMPTY: "args.team_integration_ids.length !== 0",
  TEAM_INTEGRATION_NOT_FOUND: "Team integration not found",
  TEAM_INTEGRATION_NOT_BELONGS_TO_TEAM: "Team integration does not belong to this team",
  EVENT_WATCHER_NOT_FOUND: "Event watcher not found",
  INVALID_EARG_CONDITION: "Invalid eArg (args.condition)",
  INVALID_EARG_DISPLAY_ARGS: "Invalid eArg (args.display.args)",

  // Team integration errors
  INTEGRATION_NOT_FOUND: "Integration not found",
  UPDATE_TEAM_INTEGRATION_NOT_FOUND: "Team integration not found for update",
  DELETE_TEAM_INTEGRATION_NOT_FOUND: "Team integration not found for delete",
  INVALID_DATA: "Invalid data",
  REQUIRED_FIELD_MISSING: (field: string) => `${field} is missing`,

  // Team address errors
  UPDATE_TEAM_ADDRESS_NOT_FOUND: "Team address not found for update",
  DELETE_TEAM_ADDRESS_NOT_FOUND: "Team address not found for delete",

  // Nonce errors
  NONCE_ALREADY_EXISTS: "Nonce already exists",

  // Integration API errors
  DISCORD_API_ERROR_SEND_MESSAGE: "Discord API error: sendDiscordMessage",
  DISCORD_API_ERROR_SEND_TEST_MESSAGE: "Invalid Discord Webhook URL",
  SLACK_API_ERROR_SEND_MESSAGE: "Slack API error: sendSlackMessage",
  SLACK_API_ERROR_SEND_TEST_MESSAGE: "Invalid Slack Webhook URL",
  TELEGRAM_API_ERROR_SEND_MESSAGE: "Telegram API error: sendTelegramMessage",
  TELEGRAM_API_ERROR_SEND_TEST_MESSAGE: "Invalid Telegram Chat ID",

  // Helper/Internal errors
  HANDLE_ERROR_ERROR: "handleError Error",
  PARENT_INPUT_NOT_FOUND: "!parentInput",
  GET_VALUE_FROM_EVENT_ARGS_ERROR: "!getValueFromEventArgs",
  EVENT_WATCHER_NULL: "!eventWatcher",
};
