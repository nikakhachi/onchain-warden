import { ConvexError } from "convex/values";
import { handleError } from "../errors/handleError";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const sendTelegramMessage = async (chatId: number, message: string, tryCount: number = 1) => {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  try {
    const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        disable_web_page_preview: true,
        parse_mode: "Markdown",
      }),
    });
    const data = await response.json();
    if (data.ok !== true) {
      if (tryCount > 2) {
        await handleError({ message: ERROR_MESSAGES.TELEGRAM_API_ERROR_SEND_MESSAGE, tryCount, chatId, data });
        return;
      }
      await handleError({
        message: ERROR_MESSAGES.TELEGRAM_API_ERROR_SEND_MESSAGE + " retrying in 4.5 seconds..",
        tryCount,
        chatId,
        data,
      });
      await new Promise((resolve) => setTimeout(resolve, 4500));
      await sendTelegramMessage(chatId, message, tryCount + 1);
    }
  } catch (error) {
    if (tryCount > 2) {
      await handleError({ message: ERROR_MESSAGES.TELEGRAM_API_ERROR_SEND_MESSAGE, tryCount, chatId, error });
      return;
    }
    await handleError({
      message: ERROR_MESSAGES.TELEGRAM_API_ERROR_SEND_MESSAGE + " retrying in 4.5 seconds..",
      tryCount,
      chatId,
      error,
    });
    await new Promise((resolve) => setTimeout(resolve, 4500));
    await sendTelegramMessage(chatId, message, tryCount + 1);
  }
};

export const sendTestTelegramMessage = async (chatId: number) => {
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: `You have successfully set up the Telegram integration 🚀`,
    }),
  });

  const data = await response.json();
  if (data.ok !== true) {
    console.log(data);
    console.log("chatId", chatId);
    await handleError({ error: data, where: "sendTestTelegramMessage" });
    throw new ConvexError(ERROR_MESSAGES.TELEGRAM_API_ERROR_SEND_TEST_MESSAGE);
  }
};
