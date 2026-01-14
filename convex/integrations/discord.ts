import { ConvexError } from "convex/values";
import { handleError } from "../errors/handleError";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const sendDiscordMessage = async (webhookUrl: string, message: string, tryCount: number = 1) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
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
      if (tryCount > 2) {
        await handleError({
          message: ERROR_MESSAGES.DISCORD_API_ERROR_SEND_MESSAGE,
          tryCount,
          webhookUrl,
          responseStatus: response.status,
          where: "sendDiscordMessage",
        });
        return;
      }
      await handleError({
        message: ERROR_MESSAGES.DISCORD_API_ERROR_SEND_MESSAGE + " retrying in 4.5 seconds..",
        tryCount,
        webhookUrl,
        responseStatus: response.status,
      });
      await new Promise((resolve) => setTimeout(resolve, 4500));
      await sendDiscordMessage(webhookUrl, message, tryCount + 1);
    }
  } catch (error) {
    if (tryCount > 2) {
      await handleError({ message: ERROR_MESSAGES.DISCORD_API_ERROR_SEND_MESSAGE, tryCount, webhookUrl, error });
      return;
    }
    await handleError({
      message: ERROR_MESSAGES.DISCORD_API_ERROR_SEND_MESSAGE + " retrying in 4.5 seconds..",
      tryCount,
      webhookUrl,
      error,
    });
    await new Promise((resolve) => setTimeout(resolve, 4500));
    await sendDiscordMessage(webhookUrl, message, tryCount + 1);
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
    await handleError({
      error: `sendTestDiscordMessage error to ${webhookUrl}`,
      where: "sendTestDiscordMessage",
    });
    throw new ConvexError(ERROR_MESSAGES.DISCORD_API_ERROR_SEND_TEST_MESSAGE);
  }
};
