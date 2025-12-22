import { DiscordIcon } from "./DiscordIcon";
import { TelegramIcon } from "./TelegramIcon";
import { Text } from "@chakra-ui/react";
import { SlackIcon } from "./SlackIcon";
import { WebhookIcon } from "./WebhookIcon";

export const IntegrationIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Telegram":
      return <TelegramIcon />;
    case "Discord":
      return <DiscordIcon />;
    case "Slack":
      return <SlackIcon />;
    case "Webhook":
      return <WebhookIcon />;
    default:
      return <Text>📱</Text>;
  }
};
