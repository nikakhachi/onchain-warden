import { WalletIcon } from "@/app/icons/WalletIcon";
import { Box, VStack, Text } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const Wallet = ({
  handleClick,
  isConnected,
  currentAccount,
  isAuthenticating,
}: {
  handleClick: () => void;
  isConnected: boolean;
  currentAccount?: string;
  isAuthenticating: boolean;
}) => {
  return (
    <ConnectButton.Custom>
      {({ openConnectModal, mounted }) => {
        const ready = mounted;

        return (
          <Box
            as="button"
            onClick={() => {
              if (isConnected && currentAccount) {
                handleClick();
              } else {
                handleClick();
                if (ready) openConnectModal();
              }
            }}
            disabled={!ready || isAuthenticating}
            display="flex"
            alignItems="center"
            gap={4}
            padding={4}
            borderRadius="xl"
            borderWidth="2px"
            borderColor="gray.700"
            backgroundColor="gray.800"
            color="white"
            transition="all 0.2s"
            _hover={!isAuthenticating ? { borderColor: "gray.600", backgroundColor: "gray.700" } : {}}
            width="100%"
            cursor={isAuthenticating ? "not-allowed" : "pointer"}
          >
            <Box
              width="48px"
              height="48px"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <WalletIcon />
            </Box>
            <VStack alignItems="flex-start" gap={0} flex={1}>
              <Text fontWeight="600" fontSize="md">
                EVM Extension Wallet
              </Text>
              <Text fontSize="sm" color="gray.300">
                MetaMask, Phantom, Coinbase & more
              </Text>
            </VStack>
          </Box>
        );
      }}
    </ConnectButton.Custom>
  );
};
