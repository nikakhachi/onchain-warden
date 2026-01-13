export interface Plan {
  title: "Free" | "Solo" | "Team";
  description: string;
  monthlyPrice: number;
  monthlyPriceId?: string;
  annualPrice: number;
  annualPriceId?: string;
  extraAlerts?: string;
  alerts: number;
  features: string[];
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

export const plans: Plan[] = [
  {
    title: "Free",
    description: "Perfect for getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    alerts: 5,
    features: [
      "Real-time Alerts",
      "Delivered to Telegram, Slack & Discord",
      "All Supported Chains",
      "Unlimited Channels",
      "Community Support on Discord",
    ],
    buttonText: "Get Started",
    buttonVariant: "secondary",
  },
  {
    title: "Solo",
    description: "For power users",
    monthlyPrice: 29,
    monthlyPriceId: "pri_01kew472kk53dhb8d0fq5c0989",
    annualPrice: 290,
    annualPriceId: "pri_01kew47k2rjjd15tye10hdz2hj",
    alerts: 30,
    extraAlerts: "+$5 for every extra 10 alerts",
    features: ["Real-time Alerts", "Everything in Free", "On-Demand Chain Integrations", "Priority Support"],
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
  {
    title: "Team",
    description: "For teams & organizations",
    monthlyPrice: 89,
    monthlyPriceId: "pri_01kew48ffjkka5y8ymy6xxs9ke",
    annualPrice: 890,
    annualPriceId: "pri_01kew490q5252xpm5hq4ykyn0z",
    alerts: 100,
    extraAlerts: "+$10 for every extra 25 alerts",
    features: ["Real-time Alerts", "Unlimited Members", "On-Demand Chain Integrations", "Hands-on Support"],
    buttonText: "Get Started",
    buttonVariant: "primary",
  },
];
