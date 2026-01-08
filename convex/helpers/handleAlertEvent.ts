import { Log, AbiEvent } from "viem";
import { IntegrationData } from "../../src/app/shared/enums";
import { Doc } from "../_generated/dataModel";
import { sendDiscordMessage } from "../integrations/discord";
import { sendSlackMessage } from "../integrations/slack";
import { sendTelegramMessage } from "../integrations/telegram";
import { buildText } from "./buildText";

export const handleAlertEvent = async (
  eventWatcher: Doc<"event_watchers">,
  integrationName: "Telegram" | "Discord" | "Slack",
  teamIntegrationData: any,
  chainId: number,
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  addressesMapped: Record<string, string>,
) => {
  const message = buildText(integrationName, chainId, eventWatcher, event, addressesMapped);

  if (integrationName == "Telegram") {
    await sendTelegramMessage(Number(teamIntegrationData[IntegrationData.TELEGRAM]), message);
  } else if (integrationName == "Discord") {
    await sendDiscordMessage(teamIntegrationData[IntegrationData.DISCORD], message);
  } else if (integrationName == "Slack") {
    await sendSlackMessage(teamIntegrationData[IntegrationData.SLACK], message);
  }
};
