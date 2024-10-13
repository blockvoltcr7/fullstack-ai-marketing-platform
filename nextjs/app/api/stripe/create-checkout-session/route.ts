/**
 * Stripe Checkout Session Creation API Route
 *
 * This module handles the creation of a Stripe checkout session for user subscriptions.
 * It authenticates the user, retrieves or creates a Stripe customer, and initiates a checkout session.
 *
 * @module StripeCheckoutSession
 */

import config from "@/lib/config";
import stripe from "@/lib/stripe";
import { db } from "@/server/db";
import { stripeCustomersTable } from "@/server/db/schema";
import { clerkClient, getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST handler for creating a Stripe checkout session
 *
 * @param {NextRequest} req - The incoming request object
 * @returns {Promise<NextResponse>} JSON response with checkout URL or error
 */
export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Retrieve the base URL from environment variables
    const baseUrl = process.env.APP_URL;
    if (!baseUrl) {
      throw new Error("APP_URL environment variable is not set");
    }

    // Fetch user details from Clerk
    const client = clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    console.log("Clerk User Details:", { userId, email });

    // Get or create a Stripe customer for the user
    const stripeCustomerId = await getOrCreateStripeCustomer(userId, email);

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: config.stripePriceId, // Use the price ID from the config
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${baseUrl}/settings?success=true`,
      cancel_url: `${baseUrl}/settings?canceled=true`,
      client_reference_id: userId,
    });

    // Return the checkout session URL
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Error creating checkout session", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 }
    );
  }
}

/**
 * Retrieves an existing Stripe customer or creates a new one
 *
 * @param {string} userId - The user's ID
 * @param {string} email - The user's email address
 * @returns {Promise<string>} The Stripe customer ID
 */
async function getOrCreateStripeCustomer(
  userId: string,
  email: string
): Promise<string> {
  // Check if we already have a Stripe customer for this user
  const existingCustomer = await db.query.stripeCustomersTable.findFirst({
    where: eq(stripeCustomersTable.userId, userId),
  });

  if (existingCustomer) {
    // If we have a customer, return their Stripe customer ID
    return existingCustomer.stripeCustomerId;
  }

  // If we don't have a customer, create one in Stripe
  const customer = await stripe.customers.create({
    email: email,
    metadata: { userId: userId }, // Associate the Stripe customer with our user ID
  });

  // Save the new Stripe customer ID to our database
  await db.insert(stripeCustomersTable).values({
    userId: userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
}
