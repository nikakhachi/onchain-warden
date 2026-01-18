import { Doc } from "../_generated/dataModel";
import { Address, formatUnits, isAddress, Log } from "viem";
import { AbiEvent } from "viem";
import { formatNumber } from "./formatNumber";
import { getValueFromEventArgs } from "./getValueFromEventArgs";
import { endpointIdToChain } from "@layerzerolabs/lz-definitions";
import { CHAIN_ID_TO_CHAIN } from "../viem";
import { evaluateFormula } from "./formulaUtils";
import { formatAddress } from "../../src/app/shared/helpers";
import { SEVERITY_COLORS } from "../../src/app/shared/severities";

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
  const chainData = CHAIN_ID_TO_CHAIN[chain_id];

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

  const getSeverityDisplay = (severity: keyof typeof SEVERITY_COLORS, integration: IntegrationType) => {
    const emojiMap = {
      info: "🟣",
      low: "🔵",
      medium: "🟠",
      critical: "🔴",
    };

    return `${emojiMap[severity]} ${severity.toUpperCase()}`;
  };

  // Build the message
  if (event_watcher.severity && event_watcher.display.severity) {
    text += `${getSeverityDisplay(event_watcher.severity, integration)}\n\n`;
  }

  if (event_watcher.display.label) {
    text += `${bold(event_watcher.label)}\n\n`;
  }

  if (event_watcher.display.timestamp) {
    text += `⏰ ${formatEpochUTC(Number(event.blockTimestamp))} UTC\n\n`;
  }

  if (event_watcher.display.chain) {
    text += `⛓️ ${bold(chainData.name)}\n\n`;
  }

  if (event_watcher.display.contract_address) {
    text += `📜 ${link(
      event_watcher.contract_address,
      `${chainData.blockExplorer}/address/${event_watcher.contract_address}`,
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
      // NEW: If user provided a custom formula, evaluate it
    } else if (arg.formula) {
      try {
        const result = evaluateFormula(arg.formula, value);
        displayedValue = formatNumber(result);
      } catch (error) {
        // Fallback to regular formatting if formula fails
        console.error(`Formula evaluation failed for ${arg.key}:`, error);
        displayedValue = value;
      }
      // If the argument is a number and user provided decimals for formatting, we format it
    } else if (arg.decimals) {
      displayedValue = formatNumber(Number(formatUnits(value, arg.decimals)));
      // If the argument is an address we display it with a link and optional address label
    } else if (isAddress(String(value))) {
      if (!addressLabel) {
        displayedValue = link(String(value), `${chainData.blockExplorer}/address/${String(value)}`);
      } else {
        displayedValue = `${addressLabel} ${link(formatAddress(String(value)), `${chainData.blockExplorer}/address/${String(value)}`)}`;
      }
    }

    text += `${bold(argLabel.replaceAll(".", "_"))}: ${displayedValue}\n`;
  }

  if (event_watcher.display.explorer_link) {
    text += `\n🔗 ${link("Explorer", `${chainData.blockExplorer}/tx/${event.transactionHash}`)}`;
  }

  if (event_watcher.display.layerzer_link) {
    text += `\n🔗 ${link("LayerZero Scan", `https://layerzeroscan.com/tx/${event.transactionHash}`)}\n`;
  }

  // remove last \n
  return text.trimEnd();
};
