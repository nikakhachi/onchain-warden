import { ConvexError } from "convex/values";

export const sendTelegramErrorMessage = async (error: any) => {
  const [errorBotToken, errorChatId] = [process.env.TELEGRAM_ERROR_BOT_TOKEN, process.env.TELEGRAM_ERROR_CHAT_ID];

  const response = await fetch(`https://api.telegram.org/bot${errorBotToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: errorChatId,
      text: JSON.stringify(error, null, 2),
    }),
  });
  const data = await response.json();
  if (data.ok !== true) {
    console.log(data);
    console.log("error", error);
    throw new ConvexError("Telegram API error: sendTelegramErrorMessage");
  }
};
