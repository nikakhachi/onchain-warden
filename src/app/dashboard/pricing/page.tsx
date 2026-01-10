"use client";

import { PricingContent } from "@/app/components/Pricing";
import { Container } from "@chakra-ui/react";
import { LoadingScreen } from "../components/LoadingScreen";
import { useAuth } from "@/app/providers/AuthContext";

export default function TeamsPage() {
  const { currentUser } = useAuth();

  if (!currentUser) return <LoadingScreen />;

  return (
    <Container maxW="8xl" py={8}>
      <PricingContent page="dashboard-pricing" />
    </Container>
  );
}
