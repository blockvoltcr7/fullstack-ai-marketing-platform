import Stripe from "stripe";
import config from "./config";

if (!config.stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set in the environment variables");
}

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: "2024-06-20",
});

export default stripe;
