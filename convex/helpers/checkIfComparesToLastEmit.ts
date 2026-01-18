import { Doc } from "../_generated/dataModel";

export const checkIfComparesToLastEmit = (watcher: Doc<"event_watchers">) => {
  if (watcher.condition.some((item) => item.operator === "rel")) return true;

  return false;
};
