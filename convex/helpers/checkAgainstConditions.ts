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
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).lte(conditionItem.value);
    } else if (conditionItem.operator === "rel" && watcher.last_emit) {
      const prevValue = getValueFromEventArgs(watcher.last_emit, conditionItem.field);
      const currValue = getValueFromEventArgs(event.args, conditionItem.field);

      const max = BigNumber.max(prevValue, currValue);
      const min = BigNumber.min(prevValue, currValue);

      result = max.minus(min).dividedBy(min).multipliedBy(100).gte(conditionItem.value);
    }

    if (!result) break;
  }

  return result;
};
