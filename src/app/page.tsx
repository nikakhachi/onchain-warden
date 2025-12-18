import { Box } from "@chakra-ui/react";
import { EventSubscriptionForm } from "./components/EventSubscriptionForm";

export default function Home() {
  return (
    <Box minH="100vh" padding={10}>
      <EventSubscriptionForm />
    </Box>
  );
}
