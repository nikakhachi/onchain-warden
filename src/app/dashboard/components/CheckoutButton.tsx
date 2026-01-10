import { Button } from "@/app/components/Button";
import { Link } from "@chakra-ui/react";
import { Plan } from "@/app/shared/plans";
import { useSubscription } from "@/app/providers/SubscriptionContext";

export const CheckoutButton = ({
  page,
  plan,
  isYearly,
}: {
  page: "landing" | "dashboard-pricing";
  plan: Plan;
  isYearly: boolean;
}) => {
  const { handleCheckout } = useSubscription();

  return (
    <Link href={page === "landing" ? "/dashboard/pricing" : ""}>
      <Button
        onClick={() => page !== "landing" && handleCheckout(isYearly ? plan.annualPriceId : plan.monthlyPriceId)}
        variant={plan.buttonVariant as "primary" | "secondary"}
        size="md"
        width="100%"
      >
        {plan.buttonText}
      </Button>
    </Link>
  );
};
