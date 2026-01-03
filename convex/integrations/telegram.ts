import { ConvexError } from "convex/values";
import { handleError } from "../errors/handleError";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const sendTelegramMessage = async (chatId: number, message: string) => {
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
    console.log(data);
    console.log("chatId", chatId);
    console.log("message", message);
    throw new ConvexError(ERROR_MESSAGES.TELEGRAM_API_ERROR_SEND_MESSAGE);
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
