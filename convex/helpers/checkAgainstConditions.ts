import { AbiEvent } from "viem";
import { Log } from "viem";
import BigNumber from "bignumber.js";
import { getValueFromEventArgs } from "./getValueFromEventArgs";
import { evaluateFormulaCondition } from "./formulaUtils";

export const checkAgainstConditions = (
  event: Log<bigint, number, false, AbiEvent, undefined, [AbiEvent], string>,
  conditions: { field: string; operator: string; value: string }[],
  prevEventArgs?: any,
) => {
  let result = true;

  for (const conditionItem of conditions) {
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
    } else if (conditionItem.operator === "rel" && prevEventArgs) {
      const prevValue = BigNumber(String(getValueFromEventArgs(prevEventArgs, conditionItem.field)));
      const currValue = BigNumber(String(getValueFromEventArgs(event.args, conditionItem.field)));

      if (prevValue.isZero()) {
        result = !currValue.isZero();
      } else {
        const diff = currValue.minus(prevValue).dividedBy(prevValue).multipliedBy(100).abs();

        result = diff.gte(conditionItem.value);
      }
    }

    if (!result) break;
  }

  return result;
};
