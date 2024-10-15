interface Config {
  isTestMode: boolean;
  stripePriceId: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  subscriptionPrice: number;
  subscriptionCurrency: string;
}

const config: Config = {
  isTestMode: process.env.STRIPE_MODE === "test",
  stripePriceId:
    process.env.STRIPE_MODE === "test"
      ? process.env.STRIPE_PRICE_ID_TEST!
      : process.env.STRIPE_PRICE_ID!,
  stripePublishableKey:
    process.env.STRIPE_MODE === "test"
      ? process.env.STRIPE_PUBLISHABLE_KEY_TEST!
      : process.env.STRIPE_PUBLISHABLE_KEY!,
  stripeSecretKey:
    process.env.STRIPE_MODE === "test"
      ? process.env.STRIPE_SECRET_KEY_TEST!
      : process.env.STRIPE_SECRET_KEY!,
  stripeWebhookSecret:
    process.env.STRIPE_MODE === "test"
      ? process.env.STRIPE_WEBHOOK_SECRET_TEST!
      : process.env.STRIPE_WEBHOOK_SECRET!,
  subscriptionPrice:
    process.env.STRIPE_MODE === "test"
      ? 0.0 // Test mode price
      : 0.0, // Production mode price
  subscriptionCurrency: "USD",
};

export const getSubscriptionPrice = (): number => {
  return config.subscriptionPrice;
};

export const getSubscriptionCurrency = (): string => {
  return config.subscriptionCurrency;
};

export default config;
