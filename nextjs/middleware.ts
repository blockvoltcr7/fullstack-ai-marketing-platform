/**
 * This middleware file is used in Next.js applications to handle requests
 * before they reach the actual route handlers. Middleware can be used for
 * various purposes such as authentication, logging, and modifying requests
 * or responses. In this case, we are using Clerk's middleware to manage
 * authentication and user sessions.
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

//TODO: add public and private routes
const isPublicRoute = createRouteMatcher(["/", "/pricing"]);

// Custom middleware logic
export default clerkMiddleware((auth, request) => {
  // if a user is not authenticated and they are trying to access a private route, redirect them to the clerk login page
  if (!auth().userId && !isPublicRoute(request)) {
    auth().protect();
  }
});

// Configuration for the middleware
export const config = {
  matcher: [
    // This regex pattern skips Next.js internal routes and all static files
    // (like images, styles, and scripts) unless they are found in the search
    // parameters. This is important to ensure that the middleware does not
    // interfere with the loading of essential assets.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // This pattern ensures that the middleware always runs for API routes
    // and TRPC (TypeScript Remote Procedure Call) routes, allowing for
    // authentication checks on these endpoints.
    "/(api|trpc)(.*)",
  ],
};
