"use client";

import { Select } from "@chakra-ui/react";
import { SeverityType } from "../shared/types";
import { SEVERITIES_LIST } from "../shared/severities";

interface SeverityDropdownProps {
  value: SeverityType;
  onChange: (severity: SeverityType) => void;
}

export function SeverityDropdown({ value, onChange }: SeverityDropdownProps) {
  const capitalizeFirst = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Select
      value={value}
      onChange={(e) => onChange(e.target.value as SeverityType)}
      backgroundColor="gray.800"
      borderColor="gray.700"
      color="white"
      cursor="pointer"
      width="fit-content"
      minWidth="150px"
      _hover={{
        borderColor: "gray.600",
      }}
      _focus={{
        borderColor: "blue.500",
        boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)",
      }}
    >
      {SEVERITIES_LIST.map((severity) => (
        <option key={severity} value={severity} style={{ backgroundColor: "#1a202c" }}>
          {capitalizeFirst(severity)}
        </option>
      ))}
    </Select>
  );
}
