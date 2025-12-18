import { Box } from "@chakra-ui/react";
import { EventSubscriptionForm } from "./components/EventSubscriptionForm";
import { ConnectWalletButton } from "./components/ConnectWalletButton";

export default function Home() {
  return (
    <Box minH="100vh" padding={10}>
      <ConnectWalletButton />
      <EventSubscriptionForm />
    </Box>
  );
}
