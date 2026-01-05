import { CHAIN_ID_TO_NAME } from "../viem";
import { Doc } from "../_generated/dataModel";
import { Address, formatUnits, isAddress, Log } from "viem";
import { AbiEvent } from "viem";
import { CHAIN_ID_TO_EXPLORER } from "../viem";
import { formatNumber } from "./formatNumber";
import { getValueFromEventArgs } from "./getValueFromEventArgs";
import { formatAddress } from "../../src/app/helpers";
import { endpointIdToChain } from "@layerzerolabs/lz-definitions";

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

type IntegrationType = "Telegram" | "Discord" | "Slack";

export const buildText = (
  integration: IntegrationType,
  chain_id: number,
  event_watcher: Doc<"event_watchers">,
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  addressLabels?: Record<string, string>, // address -> label
) => {
  let text = "";

  // Helper functions for formatting
  const bold = (str: string) => {
    switch (integration) {
      case "Telegram":
      case "Slack":
        return `*${str}*`;
      case "Discord":
        return `**${str}**`;
    }
  };

  const italic = (str: string) => {
    switch (integration) {
      case "Telegram":
      case "Discord":
        return `_${str}_`;
      case "Slack":
        return `_${str}_`;
    }
  };

  const link = (text: string, url: string) => {
    switch (integration) {
      case "Telegram":
        return `[${text}](${url})`;
      case "Discord":
        return `[${text}](${url})`;
      case "Slack":
        return `<${url}|${text}>`;
    }
  };

  const code = (str: string) => {
    switch (integration) {
      case "Telegram":
      case "Discord":
      case "Slack":
        return `\`${str}\``;
    }
  };

  // Build the message
  if (event_watcher.display.label) {
    text += `${bold(event_watcher.label)}\n\n`;
  }

  if (event_watcher.display.timestamp) {
    text += `⏰ ${formatEpochUTC(Number(event.blockTimestamp))} UTC\n\n`;
  }

  if (event_watcher.display.chain) {
    text += `⛓️ ${bold(CHAIN_ID_TO_NAME[chain_id])}\n\n`;
  }

  if (event_watcher.display.contract_address) {
    text += `📜 ${link(
      event_watcher.contract_address,
      `${CHAIN_ID_TO_EXPLORER[chain_id]}/address/${event_watcher.contract_address}`,
    )}\n\n`;
  }

  if (event_watcher.display.event_abi) {
    text += `🎉 ${event_watcher.event_abi}\n\n`;
  }

  for (const arg of event_watcher.display.args) {
    const value = getValueFromEventArgs(event.args, arg.key);
    let addressLabel = addressLabels?.[value] as Address | undefined;
    const argLabel = arg.label || arg.key;

    let displayedValue = String(value);

    // If the argument is LZ Endpoint ID, we need to convert it to the chain name
    if (
      (event_watcher.event_abi.includes("OFTSent") || event_watcher.event_abi.includes("OFTReceived")) &&
      (arg.key === "dstEid" || arg.key === "srcEid")
    ) {
      try {
        const chainName = endpointIdToChain(Number(value));
        displayedValue = chainName.charAt(0).toUpperCase() + chainName.slice(1);
      } catch (error) {
        displayedValue = `${String(value)} (LayerZero ID of the Chain)`;
      }
      // If the argument is a number and user provided decimals for formatting, we format it
    } else if (arg.decimals) {
      displayedValue = formatNumber(Number(formatUnits(value, arg.decimals)));
      // If the argument is an address we display it with a link and optional address label
    } else if (isAddress(String(value))) {
      if (!addressLabel) {
        displayedValue = link(String(value), `${CHAIN_ID_TO_EXPLORER[chain_id]}/address/${String(value)}`);
      } else {
        displayedValue = `${addressLabel} ${link(formatAddress(String(value)), `${CHAIN_ID_TO_EXPLORER[chain_id]}/address/${String(value)}`)}`;
      }
    }

    text += `${bold(argLabel.replaceAll(".", "_"))}: ${displayedValue}\n`;
  }

  if (event_watcher.display.explorer_link) {
    text += `\n🔗 ${link("Explorer", `${CHAIN_ID_TO_EXPLORER[chain_id]}/tx/${event.transactionHash}`)}`;
  }

  if (event_watcher.display.layerzer_link) {
    text += `\n🔗 ${link("LayerZero Scan", `https://layerzeroscan.com/tx/${event.transactionHash}`)}\n`;
  }

  // remove last \n
  return text.trimEnd();
};
