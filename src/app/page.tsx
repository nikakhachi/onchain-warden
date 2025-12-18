import { Box } from "@chakra-ui/react";
import { EventSubscriptionForm } from "./components/EventSubscriptionForm";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import { Metrics } from "./components/Metrics";
import { UserTasks } from "./components/UserTasks";

export default function Home() {
  return (
    <Box minH="100vh" padding={10}>
      <ConnectWalletButton />
      <Metrics />
      <Box marginTop={8}>
        <UserTasks />
      </Box>
      <Box marginTop={8}>
        <EventSubscriptionForm />
      </Box>
    </Box>
  );
}
