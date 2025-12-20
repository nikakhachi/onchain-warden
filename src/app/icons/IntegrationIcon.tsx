import { TelegramIcon } from "./TelegramIcon";
import { Text } from "@chakra-ui/react";

export const IntegrationIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Telegram":
      return <TelegramIcon />;
    default:
      return <Text>📱</Text>;
  }
};
