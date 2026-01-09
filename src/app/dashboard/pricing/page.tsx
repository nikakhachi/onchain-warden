import { PricingContent } from "@/app/components/Pricing";
import { Container } from "@chakra-ui/react";

export default function TeamsPage() {
  return (
    <Container maxW="8xl" py={8}>
      <PricingContent page="dashboard-pricing" />
    </Container>
  );
}
