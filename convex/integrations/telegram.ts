import { ConvexError } from "convex/values";
import { AbiEvent, Log } from "viem";
import { Doc } from "../_generated/dataModel";
import { buildText } from "../helpers/buildText";
import { sendTelegramErrorMessage } from "../errors/sendTelegramError";

export const sendTelegramMessage = async (
  chain_id: number,
  event_watcher: Doc<"event_watchers">,
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  chatId: number,
  addressLabels: Record<string, string> // address -> label
) => {
  const text = buildText(chain_id, event_watcher, event, addressLabels);
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        disable_web_page_preview: true,
        parse_mode: "Markdown",
      }),
    }
  );
  const data = await response.json();
  if (data.ok !== true) {
    console.log(data);
    console.log("chatId", chatId);
    console.log("text", text);
    throw new ConvexError("Telegram API error: sendTelegramMessage");
  }
};

export const sendTestTelegramMessage = async (chatId: number) => {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `You have successfully set up the Telegram integration 🚀`,
      }),
    }
  );

  const data = await response.json();
  if (data.ok !== true) {
    console.log(data);
    console.log("chatId", chatId);
    await sendTelegramErrorMessage({
      error: data,
      where: "sendTestTelegramMessage",
    });
    throw new ConvexError("Telegram API error: sendTestTelegramMessage");
  }
};
