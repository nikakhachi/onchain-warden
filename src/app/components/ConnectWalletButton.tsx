"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Box } from "@chakra-ui/react";

export function ConnectWalletButton() {
  return (
    <Box display="flex" justifyContent="center" marginBottom={6}>
      <ConnectButton />
    </Box>
  );
}

