import { ConvexError } from "convex/values";
import { handleError } from "../errors/handleError";

export const sendSlackMessage = async (webhookUrl: string, message: string) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: message,
      username: "Onchain Warden",
      icon_url: "https://onchainwarden.com/logo_bg_dark.png",
      blocks: [{ type: "section", text: { type: "mrkdwn", text: message } }, { type: "divider" }],
    }),
  });

  const responseText = await response.text();

  if (responseText !== "ok") {
    console.log(responseText);
    throw new ConvexError("Slack API error: sendSlackMessage");
  }
};

export const sendTestSlackMessage = async (webhookUrl: string) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: "You have successfully set up the Slack integration 🚀",
      username: "Onchain Warden",
      icon_url: "https://onchainwarden.com/logo_bg_dark.png",
    }),
  });

  const responseText = await response.text();

  if (responseText !== "ok") {
    console.log(responseText);
    await handleError({
      error: `sendTestSlackMessage error to ${webhookUrl}`,
      where: "sendTestSlackMessage",
    });
    throw new ConvexError("Slack API error: sendTestSlackMessage");
  }
};
