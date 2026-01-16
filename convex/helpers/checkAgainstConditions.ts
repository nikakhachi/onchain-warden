import { AbiEvent } from "viem";
import { Log } from "viem";
import BigNumber from "bignumber.js";
import { getValueFromEventArgs } from "./getValueFromEventArgs";
import { evaluateFormulaCondition } from "./formulaUtils";
import { Doc } from "../_generated/dataModel";

export const checkAgainstConditions = (
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  watcher: Doc<"event_watchers">,
) => {
  let result = true;

  for (const conditionItem of watcher.condition) {
    if (conditionItem.operator === "custom_formula") {
      // @ts-ignore
      const fieldValue = getValueFromEventArgs(event.args, conditionItem.field);
      result = evaluateFormulaCondition(conditionItem.value, fieldValue);
    } else if (conditionItem.operator === "==") {
      // @ts-ignore
      result = getValueFromEventArgs(event.args, conditionItem.field) === conditionItem.value;
    } else if (conditionItem.operator === "!=") {
      // @ts-ignore
      result = getValueFromEventArgs(event.args, conditionItem.field) !== conditionItem.value;
    } else if (conditionItem.operator === ">") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).gt(conditionItem.value);
    } else if (conditionItem.operator === ">=") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).gte(conditionItem.value);
    } else if (conditionItem.operator === "<") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).lt(conditionItem.value);
    } else if (conditionItem.operator === "<=") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).lte(conditionItem.value);
    } else if (conditionItem.operator === "rel") {
      // TODO: Figure out abs and rel comparisons with BigNumber
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).lte(conditionItem.value);
    }

    if (!result) break;
  }

  return result;
};
