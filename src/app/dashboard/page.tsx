import { Box, Container } from "@chakra-ui/react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { EventSubscriptionForm } from "../components/EventSubscriptionForm";
import { UserTasks } from "../components/UserTasks";

export default function Dashboard() {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      backgroundColor="gray.950"
    >
      <Navbar />
      <Box flex={1} paddingY={10}>
        <Container maxW="7xl">
          <Box marginBottom={10}>
            <UserTasks />
          </Box>
          <Box>
            <EventSubscriptionForm />
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}

