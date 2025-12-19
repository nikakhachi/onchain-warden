import { ConvexError } from "convex/values";
import { Address, AbiEvent, Log } from "viem";
import { CHAIN_ID_TO_EXPLORER, CHAIN_ID_TO_NAME } from "../viem";
import { convertBigIntToString } from "../helpers";

const formatEpochUTC = (epoch: number) => {
  const date = new Date(epoch * 1000);

  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const min = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");

  return `${hh}:${min}:${ss}, ${dd}/${mm}/${yyyy}`;
};

export const sendTelegramMessage = async (
  chain_id: number,
  emitter_contract_address: Address,
  event_abi: string,
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  chatId: number
) => {
  const text = `⏰ ${formatEpochUTC(Number(event.blockTimestamp))} UTC
  \n⛓️ *${CHAIN_ID_TO_NAME[chain_id]}*
  \n📜 ${emitter_contract_address}
  \n🎉 ${event_abi}
  \n ${JSON.stringify(convertBigIntToString(event.args), null, 2)}
  \n🔗 ${CHAIN_ID_TO_EXPLORER[chain_id]}/tx/${event.transactionHash}`;

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
