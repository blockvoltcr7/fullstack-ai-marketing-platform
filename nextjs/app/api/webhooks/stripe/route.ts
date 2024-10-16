/**
 * This module handles incoming Stripe webhook events, specifically for subscription-related events.
 * It verifies the webhook signature, processes the event, and updates the database accordingly.
 */

import stripe from "@/lib/stripe"; // Import the Stripe client
import config from "@/lib/config"; // Import configuration settings
import { db } from "@/server/db"; // Import the database instance
import { subscriptionsTable } from "@/server/db/schema"; // Import the subscriptions table schema
import { NextResponse } from "next/server"; // Import Next.js response utilities
import Stripe from "stripe"; // Import the Stripe types

// Use the webhook secret from config instead of directly from process.env
const webhookSecret = config.stripeWebhookSecret; // Retrieve the webhook secret from the configuration
console.log(`Webhook secret: ${config.isTestMode ? webhookSecret : "****"}`); // Log the webhook secret for debugging purposes, masking it in live mode

const log = (
  message: string,
  data?: object | string | number | boolean | null
) => {
  console.log(
    JSON.stringify({ message, data, timestamp: new Date().toISOString() })
  );
};

/**
 * Handles POST requests for Stripe webhooks.
 * @param req - The incoming request object containing the webhook event.
 * @returns A JSON response indicating the result of the processing.
 */
export async function POST(req: Request) {
  const body = await req.text(); // Read the request body as text
  const signature = req.headers.get("stripe-signature") as string; // Retrieve the Stripe signature from headers

  console.log(`Received webhook event: ${body}`); // Log the received webhook event

  let event: Stripe.Event; // Declare a variable to hold the Stripe event

  try {
    // Verify the webhook signature to ensure the request is from Stripe
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err); // Log the error if verification fails
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 }); // Return a 400 response for invalid signature
  }

  console.log(`Processing event of type: ${event.type}`); // Log the type of event being processed

  try {
    log("Starting webhook processing", { eventType: event.type });
    // Handle different types of events from Stripe
    switch (event.type) {
      case "customer.subscription.created": // Check for subscription creation event
        const subscription = event.data.object as Stripe.Subscription; // Cast the event data to a Subscription object
        await handleNewSubscription(subscription); // Process the new subscription
        break;
      default:
        console.log(`Unhandled event type ${event.type}`); // Log unhandled event types
    }

    log("Finished webhook processing", { eventType: event.type });
    return NextResponse.json({ received: true }); // Return a success response
  } catch (error) {
    console.error(`Error processing webhook: ${error}`); // Log any errors during processing
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 } // Return a 500 response for processing errors
    );
  }
}

/**
 * Handles the processing of a new subscription.
 * @param subscription - The Stripe subscription object to process.
 */
async function handleNewSubscription(subscription: Stripe.Subscription) {
  console.log(`Processing new subscription: ${subscription.id}`); // Log the subscription ID being processed

  let userId: string | undefined; // Declare userId outside the try block

  try {
    // Retrieve the customer associated with the subscription
    const customer = await stripe.customers.retrieve(
      subscription.customer as string
    );

    console.log(`Retrieved customer: ${customer.id}`); // Log the retrieved customer ID

    // Check if the customer is deleted
    if (customer.deleted) {
      throw new Error(`Customer ${subscription.customer} has been deleted`); // Throw an error if the customer is deleted
    }

    userId = customer.metadata.userId; // Extract the user ID from customer metadata
    console.log(`User ID: ${userId}`); // Log the user ID

    if (!userId) {
      throw new Error(`No user ID found in customer metadata: ${customer.id}`); // Throw an error if no user ID is found
    }

    const subscriptionData = {
      userId: userId, // Set the user ID
      stripeSubscriptionId: subscription.id, // Set the Stripe subscription ID
    };

    log("Attempting to insert subscription record", {
      userId,
      subscriptionId: subscription.id,
    });
    const result = await db
      .insert(subscriptionsTable)
      .values(subscriptionData)
      .execute();
    log("Subscription record inserted", { result });
  } catch (error) {
    console.log(
      `Error processing new subscription for: ${userId || "unknown user"}`
    ); // Log the error context
    console.error(`Error processing new subscription:`, error); // Log the error details
    throw error; // Rethrow the error for further handling
  }
}
