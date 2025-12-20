import { Box } from "@chakra-ui/react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Metrics } from "./components/Metrics";
import { HowItWorks } from "./components/HowItWorks";
import { UseCases } from "./components/UseCases";

export default function Home() {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      backgroundColor="white"
    >
      <Navbar />
      <Hero />
      <Metrics />
      <HowItWorks />
      <UseCases />
      <Footer />
    </Box>
  );
}
