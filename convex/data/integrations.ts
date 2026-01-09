export const INTEGRATIONS: Record<string, { required_data: string[]; name: string } | undefined> = {
  telegram: {
    required_data: ["chatId"],
    name: "Telegram",
  },
  discord: {
    required_data: ["webhook_url"],
    name: "Discord",
  },
  slack: {
    required_data: ["webhook_url"],
    name: "Slack",
  },
};

export const INTEGRATIONS_LIST = Object.keys(INTEGRATIONS).map((key) => ({
  id: key,
  // @ts-ignore
  name: INTEGRATIONS[key].name,
  // @ts-ignore
  required_data: INTEGRATIONS[key].required_data,
}));
