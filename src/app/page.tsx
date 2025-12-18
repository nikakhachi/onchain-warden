import { Box } from "@chakra-ui/react";
import { EventSubscriptionForm } from "./components/EventSubscriptionForm";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import { Metrics } from "./components/Metrics";

export default function Home() {
  return (
    <Box minH="100vh" padding={10}>
      <ConnectWalletButton />
      <Metrics />
      <EventSubscriptionForm />
    </Box>
  );
}
