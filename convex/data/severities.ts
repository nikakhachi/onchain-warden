export const SEVERITY_COLORS = {
  info: "purple.500",
  low: "cyan.300",
  medium: "orange.300",
  critical: "red.500",
};

export const SEVERITIES_LIST = Object.keys(SEVERITY_COLORS);

export type SeverityType = "info" | "low" | "medium" | "critical";
