"use client";

import { Box, BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";

interface CardProps extends Omit<BoxProps, "backgroundColor" | "borderWidth" | "borderColor" | "borderRadius"> {
  children: ReactNode;
  hoverable?: boolean;
}

export function Card({ children, hoverable = true, ...props }: CardProps) {
  return (
    <Box
      padding={6}
      borderRadius="2xl"
      backgroundColor="rgba(33, 33, 33, 0.2)"
      borderWidth="1px"
      borderColor="gray.800"
      transition="all 0.3s"
      {...(hoverable && {
        _hover: {
          borderColor: "gray.700",
          transform: "translateY(-4px)",
        },
      })}
      {...props}
    >
      {children}
    </Box>
  );
}
