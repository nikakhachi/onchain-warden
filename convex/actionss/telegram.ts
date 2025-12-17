import { ConvexError } from "convex/values";

export const sendTelegramMessage = async (text: string, chatId: number) => {
  const response = await fetch(
    `https://api.telegram.org/bot8549552670:AAF8RMmbTziR3ek8djNy-ktALkvbN04lnjA/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    }
  );
  const data = await response.json();
  if (data.ok !== true) {
    console.log(data);
    throw new ConvexError("Telegram API error: ");
  }
};
