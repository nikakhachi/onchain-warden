import { Button } from "@/app/components/Button";
import { Plan } from "@/app/shared/plans";
import { useSubscription } from "@/app/providers/SubscriptionContext";

export const CheckoutButton = ({ plan, isYearly }: { plan: Plan; isYearly: boolean }) => {
  const { handleCheckout } = useSubscription();

  return (
    <Button
      onClick={() => handleCheckout(isYearly ? plan.annualPriceId : plan.monthlyPriceId)}
      variant={plan.buttonVariant as "primary" | "secondary"}
      size="md"
      width="100%"
    >
      {plan.buttonText}
    </Button>
  );
};
