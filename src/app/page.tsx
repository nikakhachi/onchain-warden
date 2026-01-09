import { Box } from "@chakra-ui/react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
// import { Metrics } from "./components/Metrics";
import { HowItWorks } from "./components/HowItWorks";
import { UseCases } from "./components/UseCases";
import { FAQ } from "./components/FAQ";
import { PricingPage } from "./components/Pricing";

export default function Home() {
  return (
    <Box minH="100vh" display="flex" flexDirection="column" backgroundColor="gray.950" position="relative">
      <Navbar />
      <Hero />
      <HowItWorks />
      <UseCases />
      {/* <Metrics /> */}
      <PricingPage />
      <FAQ />
      <Footer />
    </Box>
  );
}
