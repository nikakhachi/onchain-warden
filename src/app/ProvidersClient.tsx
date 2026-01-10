"use client";

import { ReactNode } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { SessionProvider } from "next-auth/react";
import { customSystem } from "./theme";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ToastProvider } from "./providers/ToastContext";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ConvexProvider client={convex}>
        <ToastProvider>
          <ChakraProvider theme={customSystem}>{children}</ChakraProvider>
        </ToastProvider>
      </ConvexProvider>
    </SessionProvider>
  );
}
