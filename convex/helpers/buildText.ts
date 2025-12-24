import { CHAIN_ID_TO_NAME } from "../viem";
import { Doc } from "../_generated/dataModel";
import { formatUnits, isAddress, Log } from "viem";
import { AbiEvent } from "viem";
import { CHAIN_ID_TO_EXPLORER } from "../viem";
import { formatNumber } from "./formatNumber";

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

export const buildText = (
  chain_id: number,
  event_watcher: Doc<"event_watchers">,
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  addressLabels: Record<string, string> // address -> label
) => {
  let text = "";

  if (event_watcher.display.label) {
    text += `*${event_watcher.label}*\n\n`;
  }

  if (event_watcher.display.timestamp) {
    text += `⏰ ${formatEpochUTC(Number(event.blockTimestamp))} UTC\n\n`;
  }

  if (event_watcher.display.chain) {
    text += `⛓️ *${CHAIN_ID_TO_NAME[chain_id]}*\n\n`;
  }

  if (event_watcher.display.contract_address) {
    text += `📜 [${event_watcher.contract_address}](${CHAIN_ID_TO_EXPLORER[chain_id]}/address/${event_watcher.contract_address})\n\n`;
  }

  if (event_watcher.display.event_abi) {
    text += `🎉 ${event_watcher.event_abi}\n\n`;
  }

  for (const arg of event_watcher.display.args) {
    // @ts-ignore
    let value = event.args[arg.key];
    if (addressLabels[value]) value = `${addressLabels[value]} ${value}`;

    const label = arg.label || arg.key;
    let displayedValue = String(value);

    if (arg.decimals) {
      displayedValue = formatNumber(Number(formatUnits(value, arg.decimals)));
    } else if (isAddress(String(value))) {
      displayedValue = `[${String(value)}](${CHAIN_ID_TO_EXPLORER[chain_id]}/address/${String(value)})`;
    }

    text += `*${label}*: ${displayedValue}\n`;
  }

  if (event_watcher.display.explorer_link) {
    text += `\n🔗 [Explorer](${CHAIN_ID_TO_EXPLORER[chain_id]}/tx/${event.transactionHash})\n`;
  }

  if (event_watcher.display.layerzer_link) {
    text += `🔗 [LayerZero Scan](https://layerzeroscan.com/tx/${event.transactionHash})\n`;
  }

  // remove last \n
  return text.trimEnd();
};
