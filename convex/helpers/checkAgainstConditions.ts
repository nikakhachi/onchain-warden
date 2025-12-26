import { AbiEvent } from "viem";
import { Log } from "viem";
import BigNumber from "bignumber.js";
import { getValueFromEventArgs } from "./getValueFromEventArgs";

export const checkAgainstConditions = (
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  condition: { field: string; operator: string; value: string }[],
) => {
  let result = true;

  for (const conditionItem of condition) {
    if (conditionItem.operator === "==") {
      // @ts-ignore
      result = getValueFromEventArgs(event.args, conditionItem.field) === conditionItem.value;
    }
    if (conditionItem.operator === "!=") {
      // @ts-ignore
      result = getValueFromEventArgs(event.args, conditionItem.field) !== conditionItem.value;
    }
    if (conditionItem.operator === ">") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).gt(conditionItem.value);
    }
    if (conditionItem.operator === ">=") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).gte(conditionItem.value);
    }
    if (conditionItem.operator === "<") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).lt(conditionItem.value);
    }
    if (conditionItem.operator === "<=") {
      // @ts-ignore
      result = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field))).lte(conditionItem.value);
    }

    if (!result) break;
  }

  return result;
};
