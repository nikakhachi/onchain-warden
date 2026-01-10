"use client";

import { PricingContent } from "@/app/components/Pricing";
import { Container } from "@chakra-ui/react";
import { LoadingScreen } from "../components/LoadingScreen";
import { useAuth } from "@/app/providers/AuthContext";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function PricingPageContent() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const highlight = searchParams.get("highlight");

  if (!currentUser) return <LoadingScreen />;

  return (
    <Container maxW="8xl" py={8}>
      <PricingContent
        page="dashboard-pricing"
        highlight={highlight === "team" ? "team" : highlight === "solo" ? "solo" : undefined}
      />
    </Container>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PricingPageContent />
    </Suspense>
  );
}
