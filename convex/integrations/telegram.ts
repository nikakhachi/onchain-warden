import { ConvexError } from "convex/values";
import { AbiEvent, Log } from "viem";
import { Doc } from "../_generated/dataModel";
import { buildText } from "../helpers/buildText";

export const sendTelegramMessage = async (
  chain_id: number,
  event_watcher: Doc<"event_watchers">,
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  chatId: number,
  addressLabels: Record<string, string> // address -> label
) => {
  const text = buildText(chain_id, event_watcher, event, addressLabels);
  const response = await fetch(
    `https://api.telegram.org/bot8549552670:AAF8RMmbTziR3ek8djNy-ktALkvbN04lnjA/sendMessage`,
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
    throw new ConvexError("Telegram API error: ");
  }
};
