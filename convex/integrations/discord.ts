import { ConvexError } from "convex/values";
import { sendTelegramErrorMessage } from "../errors/sendTelegramError";

export const sendDiscordMessage = async (webhookUrl: string, message: string) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: message,
      username: "Onchain Warden",
      avatar_url: "https://onchainwarden.com/logo_bg_dark.png",
      flags: 4,
    }),
  });

  if (response.status !== 200 && response.status !== 204) {
    console.log(response);
    throw new ConvexError("Discord API error: sendDiscordMessage");
  }
};

export const sendTestDiscordMessage = async (webhookUrl: string) => {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content: "You have successfully set up the Discord integration 🚀",
      username: "Onchain Warden",
      avatar_url: "https://onchainwarden.com/logo_bg_dark.png",
    }),
  });

  if (response.status !== 200 && response.status !== 204) {
    console.log(response);
    await sendTelegramErrorMessage({
      error: response,
      where: "sendTestDiscordMessage",
    });
    throw new ConvexError("Discord API error: sendTestDiscordMessage");
  }
};
