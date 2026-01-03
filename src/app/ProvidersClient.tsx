"use client";

import { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ChakraProvider } from "@chakra-ui/react";
import { customSystem } from "./theme";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider theme={customSystem}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ChakraProvider>
  );
}
