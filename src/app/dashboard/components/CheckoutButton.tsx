"use client";

import { useState } from "react";
import { Button } from "@/app/components/Button";
import { Plan } from "@/app/shared/plans";
import { useSubscription } from "@/app/providers/SubscriptionContext";
import { JoinWaitlistModal } from "@/app/components/JoinWaitlistModal";

export const CheckoutButton = ({ plan, isYearly }: { plan: Plan; isYearly: boolean }) => {
  const { handleCheckout } = useSubscription();
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          // Open waitlist modal instead of paddle checkout
          setIsWaitlistModalOpen(true);

          // Commented out paddle checkout integration
          // handleCheckout(isYearly ? plan.annualPriceId : plan.monthlyPriceId);
        }}
        variant={plan.buttonVariant as "primary" | "secondary"}
        size="md"
        width="100%"
      >
        {/* {plan.buttonText} */}
        Join Waitlist
      </Button>
      <JoinWaitlistModal isOpen={isWaitlistModalOpen} onClose={() => setIsWaitlistModalOpen(false)} />
    </>
  );
};
