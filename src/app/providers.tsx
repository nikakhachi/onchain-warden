"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ConvexProvider client={convex}>{children}</ConvexProvider>
    </ChakraProvider>
  );
}
