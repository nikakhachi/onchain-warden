"use client";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";
import { ReactNode } from "react";
import { GRADIENTS } from "../theme";

interface CustomButtonProps extends Omit<ButtonProps, "variant" | "size"> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: CustomButtonProps) {
  const baseStyles = {
    borderRadius: "xl",
    fontWeight: "500",
    transition: "all 0.2s",
  };

  const variantStyles = {
    primary: {
      backgroundImage: GRADIENTS.button,
      backgroundColor: "transparent",
      borderWidth: "0",
      color: "black",
      fontWeight: "600",
      _hover: {
        opacity: 0.9,
      },
      _disabled: {
        opacity: 0.5,
        cursor: "not-allowed",
        _hover: {
          opacity: 0.5,
        },
      },
    },
    secondary: {
      backgroundColor: "gray.800", // dark gray background
      color: "white",
      borderWidth: "1px",
      borderColor: "gray.600", // light gray border
      _hover: {
        backgroundColor: "gray.700",
        borderColor: "gray.500",
      },
      _disabled: {
        opacity: 0.5,
        cursor: "not-allowed",
        _hover: {
          backgroundColor: "gray.800",
          borderColor: "gray.600",
        },
      },
    },
  };

  const sizeStyles = {
    sm: {
      paddingX: 4,
      paddingY: 2,
      fontSize: "sm",
    },
    md: {
      paddingX: 6,
      paddingY: 3,
      fontSize: "md",
    },
    lg: {
      paddingX: 8,
      paddingY: 4,
      fontSize: "lg",
    },
  };

  return (
    <ChakraButton
      size={size}
      {...baseStyles}
      {...variantStyles[variant]}
      {...sizeStyles[size]}
      {...props}
    >
      {children}
    </ChakraButton>
  );
}
