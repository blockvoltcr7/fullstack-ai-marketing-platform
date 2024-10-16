/**
 * Middleware for handling authentication and authorization in a Next.js application.
 * This middleware uses Clerk for user authentication and checks for secure API routes.
 * It also validates service worker requests using a server API key.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Home page
  "/pricing", // Pricing page
  "/api/upload", // API route for uploading files
  "/api/webhooks/stripe", // Stripe webhook API route
]);

// Define secure routes that require service worker authentication
const isSecureRoute = createRouteMatcher([
  "/api/asset-processing-job", // API route for processing asset jobs
  "/api/asset", // API route for asset management
]);

// Retrieve the server API key from environment variables
const SERVER_API_KEY = process.env.SERVER_API_KEY;

// Ensure the server API key is set; throw an error if not
if (!SERVER_API_KEY) {
  throw new Error("SERVER_API_KEY is not set in the environment variables");
}

// Default export of the middleware function
export default clerkMiddleware((auth, request) => {
  // Check if the request is for a secure API route
  if (isSecureRoute(request)) {
    return checkServiceWorkerAuth(request); // Validate service worker authentication
  }

  // If the user is not authenticated and is trying to access a private route,
  // redirect them to the Clerk login page
  if (!auth().userId && !isPublicRoute(request)) {
    auth().protect(); // Protect the route
  }
});

// Configuration for the middleware matcher
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

/**
 * Function to check service worker authentication.
 * Validates the Authorization header and checks the provided API key.
 *
 * @param request - The incoming request object
 * @returns NextResponse - The response object indicating the result of the authentication check
 */
function checkServiceWorkerAuth(request: Request) {
  const authHeader = request.headers.get("Authorization"); // Get the Authorization header
  // Check if the Authorization header is missing or invalid
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new NextResponse(
      JSON.stringify({ error: "Missing or invalid Authorization header" }),
      { status: 401 } // Unauthorized
    );
  }

  const token = authHeader.split(" ")[1]; // Extract the token from the header
  // Validate the token against the server API key
  if (token !== SERVER_API_KEY) {
    return new NextResponse(JSON.stringify({ error: "Invalid API key" }), {
      status: 403, // Forbidden
    });
  }

  return NextResponse.next(); // Proceed to the next middleware or request handler
}
