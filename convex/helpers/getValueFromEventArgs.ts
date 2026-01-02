import { ConvexError } from "convex/values";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const getValueFromEventArgs = (eventArgs: Record<string, any>, key: string): any => {
  if (!key.includes(".")) return eventArgs[key];

  const parts = key.split(".");
  const [parentField, ...nestedPath] = parts;
  const parentInput = eventArgs[parentField];

  if (!parentInput) throw new ConvexError(ERROR_MESSAGES.PARENT_INPUT_NOT_FOUND);

  if (typeof parentInput === "object") {
    const nestedField = nestedPath.join(".");
    return getValueFromEventArgs(parentInput, nestedField);
  }

  throw new ConvexError(ERROR_MESSAGES.GET_VALUE_FROM_EVENT_ARGS_ERROR);
};
