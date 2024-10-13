/**
 * This API route handles the creation of a Stripe billing portal session for the authenticated user.
 * It retrieves the user's Stripe customer ID from the database and generates a session URL for managing
 * their subscription. The session URL is then returned in the response.
 */

import stripe from "@/lib/stripe"; // Importing the configured Stripe instance
import { db } from "@/server/db"; // Importing the database instance
import { stripeCustomersTable } from "@/server/db/schema"; // Importing the schema for the Stripe customers table
import { getAuth } from "@clerk/nextjs/server"; // Importing the authentication function from Clerk
import { eq } from "drizzle-orm"; // Importing the equality operator for querying
import { NextRequest, NextResponse } from "next/server"; // Importing Next.js request and response types

/**
 * Handles POST requests to create a billing portal session.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse object containing the session URL or an error message.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Retrieve the authenticated user's ID from the request
    const { userId } = getAuth(req);

    // If no user ID is found, return an unauthorized error response
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the base URL from environment variables
    const baseUrl = process.env.APP_URL;

    // If the base URL is not set, throw an error
    if (!baseUrl) {
      throw new Error("APP_URL environment variable is not set");
    }

    // Query the database to find the Stripe customer associated with the user ID
    const customer = await db.query.stripeCustomersTable.findFirst({
      where: eq(stripeCustomersTable.userId, userId),
    });

    // If no customer is found, return a not found error response
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Create a billing portal session using the Stripe API
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.stripeCustomerId, // The Stripe customer ID
      return_url: `${baseUrl}/settings`, // The URL to redirect to after managing the subscription
    });

    //print the session URL to the console
    console.log("Billing portal session URL:", session.url);

    // Return the session URL in the response
    return NextResponse.json({ url: session.url });
  } catch (error) {
    // Log the error for debugging purposes
    console.error("Error creating portal session", error);

    // Return a server error response
    return NextResponse.json(
      { error: "Error creating portal session" },
      { status: 500 }
    );
  }
}
