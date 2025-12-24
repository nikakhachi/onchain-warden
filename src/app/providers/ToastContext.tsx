"use client";

import { createContext, useContext, ReactNode } from "react";
import { useToast as useChakraToast, UseToastOptions } from "@chakra-ui/react";

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastOptions {
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const chakraToast = useChakraToast();

  const getToastConfig = (
    description: string,
    variant: ToastVariant = "info"
  ): UseToastOptions => {
    const config: UseToastOptions = {
      description,
      duration: variant === "error" ? 5000 : 3000,
      isClosable: true,
      position: "bottom-right",
      containerStyle: {
        maxWidth: "400px",
      },
    };

    switch (variant) {
      case "success":
        return {
          ...config,
          status: "success",
          colorScheme: "green",
        };
      case "error":
        return {
          ...config,
          status: "error",
          colorScheme: "red",
        };
      case "warning":
        return {
          ...config,
          status: "warning",
          colorScheme: "orange",
        };
      case "info":
      default:
        return {
          ...config,
          status: "info",
          colorScheme: "blue",
        };
    }
  };

  const toast = (options: ToastOptions) => {
    chakraToast(getToastConfig(options.description, options.variant || "info"));
  };

  const success = (message: string) => {
    toast({ description: message, variant: "success" });
  };

  const error = (message: string) => {
    toast({ description: message, variant: "error" });
  };

  const info = (message: string) => {
    toast({ description: message, variant: "info" });
  };

  const warning = (message: string) => {
    toast({ description: message, variant: "warning" });
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
