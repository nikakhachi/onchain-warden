"use client";

import { Button as ChakraButton, ButtonProps } from "@chakra-ui/react";
import { ReactNode } from "react";

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
      backgroundColor: "rgb(124, 58, 237)", // deeper, richer purple
      color: "white",
      _hover: {
        backgroundColor: "rgb(109, 40, 217)", // darker purple on hover
      },
    },
    secondary: {
      backgroundColor: "rgba(20, 184, 166, 0.1)", // light teal with opacity
      color: "rgb(20, 184, 166)", // teal text
      borderWidth: "1px",
      borderColor: "rgba(20, 184, 166, 0.3)",
      _hover: {
        backgroundColor: "rgba(20, 184, 166, 0.2)", // slightly more opaque on hover
        borderColor: "rgba(20, 184, 166, 0.5)",
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
