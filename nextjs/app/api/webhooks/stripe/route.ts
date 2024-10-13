import stripe from "@/lib/stripe";
import config from "@/lib/config";
import { db } from "@/server/db";
import { subscriptionsTable } from "@/server/db/schema";
import { NextResponse } from "next/server";
import Stripe from "stripe";

// Use the webhook secret from config instead of directly from process.env
const webhookSecret = config.stripeWebhookSecret;
console.log(`Webhook secret: ${webhookSecret}`);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  console.log(`Received webhook event: ${body}`);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`Processing event of type: ${event.type}`);

  try {
    switch (event.type) {
      case "customer.subscription.created":
        const subscription = event.data.object as Stripe.Subscription;
        await handleNewSubscription(subscription);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook: ${error}`);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleNewSubscription(subscription: Stripe.Subscription) {
  console.log(`Processing new subscription: ${subscription.id}`);

  let userId: string | undefined; // Declare userId outside the try block

  try {
    // Retrieve the customer
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );

    console.log(`Retrieved customer: ${customer.id}`);

    // Check if the customer is deleted
    if (customer.deleted) {
      throw new Error(`Customer ${subscription.customer} has been deleted`);
    }

    userId = customer.metadata.userId;
    console.log(`User ID: ${userId}`);

    if (!userId) {
      throw new Error(`No user ID found in customer metadata: ${customer.id}`);
    }

    const subscriptionData = {
      userId: userId,
      stripeSubscriptionId: subscription.id,
    };

    console.log(`Inserting subscription record for user ${userId}`);
    await db.insert(subscriptionsTable).values(subscriptionData).execute();
    console.log(`Inserted subscription record for user ${userId}`);
  } catch (error) {
    console.log(
      `Error processing new subscription for: ${userId || "unknown user"}`
    );
    console.error(`Error processing new subscription:`, error);
    throw error;
  }
}
