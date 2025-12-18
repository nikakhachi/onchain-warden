import { Box } from "@chakra-ui/react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { Metrics } from "./components/Metrics";

export default function Home() {
  return (
    <Box
      minH="100vh"
      display="flex"
      flexDirection="column"
      backgroundColor="gray.950"
    >
      <Navbar />
      <Hero />
      <Features />
      <Metrics />
      <Footer />
    </Box>
  );
}
