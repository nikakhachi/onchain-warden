import { ConvexError } from "convex/values";
import { ERROR_MESSAGES } from "../errors/errorMessages";

export const getValueFromEventArgs = (eventArgs: Record<string, any>, key: string): any => {
  if (!key.includes(".")) return eventArgs[key];

  const [parentField, ...rest] = key.split(".");
  const parent = eventArgs[parentField];
  if (!parent) throw new ConvexError(ERROR_MESSAGES.PARENT_INPUT_NOT_FOUND);

  const nestedKey = rest.join(".");
  // Handle arrays (tuple[]): extract field from each element
  if (Array.isArray(parent)) return parent.map((item) => getValueFromEventArgs(item, nestedKey));
  // Handle objects (tuple): recurse
  if (typeof parent === "object") return getValueFromEventArgs(parent, nestedKey);

  throw new ConvexError(ERROR_MESSAGES.GET_VALUE_FROM_EVENT_ARGS_ERROR);
};
