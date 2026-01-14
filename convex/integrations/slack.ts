import { ConvexError } from "convex/values";
import { handleError } from "../errors/handleError";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const sendSlackMessage = async (webhookUrl: string, message: string, tryCount: number = 1) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
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
      if (tryCount > 2) {
        await handleError({ message: ERROR_MESSAGES.SLACK_API_ERROR_SEND_MESSAGE, tryCount, webhookUrl });
        return;
      }
      await handleError({
        message: ERROR_MESSAGES.SLACK_API_ERROR_SEND_MESSAGE + " retrying in 4.5 seconds..",
        tryCount,
        webhookUrl,
      });
      await new Promise((resolve) => setTimeout(resolve, 4500));
      await sendSlackMessage(webhookUrl, message, tryCount + 1);
    }
  } catch (error) {
    if (tryCount > 2) {
      await handleError({ message: ERROR_MESSAGES.SLACK_API_ERROR_SEND_MESSAGE, tryCount, webhookUrl, error });
      return;
    }
    await handleError({
      message: ERROR_MESSAGES.SLACK_API_ERROR_SEND_MESSAGE + " retrying in 4.5 seconds..",
      tryCount,
      webhookUrl,
      error,
    });
    await new Promise((resolve) => setTimeout(resolve, 4500));
    await sendSlackMessage(webhookUrl, message, tryCount + 1);
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
    throw new ConvexError(ERROR_MESSAGES.SLACK_API_ERROR_SEND_TEST_MESSAGE);
  }
};
