import { ConvexError } from "convex/values";

export const getValueFromEventArgs = (
  eventArgs: Record<string, any>,
  key: string
): any => {
  if (!key.includes(".")) return eventArgs[key];

  const parts = key.split(".");
  const [parentField, ...nestedPath] = parts;
  const parentInput = eventArgs[parentField];

  if (!parentInput) throw new ConvexError("!parentInput");

  if (typeof parentInput === "object") {
    const nestedField = nestedPath.join(".");
    return getValueFromEventArgs(parentInput, nestedField);
  }

  throw new ConvexError("!getValueFromEventArgs");
};
