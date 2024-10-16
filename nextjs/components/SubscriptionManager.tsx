// Start of Selection
/**
 * SubscriptionManager Component Overview:
 *
 * The SubscriptionManager component serves as the primary interface for managing user subscriptions.
 * It performs the following key functions:
 *
 * 1. **Initial Mounting**: Handles the initial rendering and sets up state management.
 * 2. **URL Parameter Processing**: Processes URL parameters to display success or cancellation messages.
 *
 * 3. **Subscription Status Display**:
 *    - For **Active Subscribers**: Shows current plan details and a button to manage the subscription.
 *    - For **Non-Subscribers**: Displays free plan status, subscription features, and a button to subscribe.
 *
 * 4. **State Management**: Utilizes hooks such as `useState` for local state management and `useRouter` for navigation.
 *
 * 5. **Stripe API Interaction**: Interacts with Stripe API endpoints for creating checkout sessions and managing subscriptions.
 *
 * 6. **User Feedback**: Implements toast notifications to provide feedback on subscription actions.
 *
 * 7. **Responsive Design**: Incorporates responsive design classes to ensure usability across different screen sizes.
 *
 * 8. **Helper Functions**: Utilizes helper functions like `getSubscriptionStatus` and `formatDate` for formatting and displaying subscription information.
 *
 * This component offers a comprehensive interface for users to:
 * - View their subscription status
 * - Manage existing subscriptions
 * - Subscribe to new plans
 *
 * All while effectively handling necessary API interactions and providing appropriate user feedback.
 */

"use client";

import React, { useEffect, useState } from "react";
import Stripe from "stripe";
import { Button } from "./ui/button";
import { Box, LayoutTemplate, Star } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getSubscriptionPrice, getSubscriptionCurrency } from "@/lib/config";

/**
 * Interface for the props of the SubscriptionManager component.
 * @property {Stripe.Subscription | null} subscription - The user's current subscription status.
 */
interface SubscriptionManagerProps {
  subscription: Stripe.Subscription | null;
}

/**
 * SubscriptionManager Component
 *
 * This component manages the display and interaction for user subscriptions.
 * It handles subscription status, checkout process, and displays relevant information.
 *
 * @param {SubscriptionManagerProps} props - The props for the component.
 * @returns {JSX.Element} The rendered SubscriptionManager component.
 */
function SubscriptionManager({ subscription }: SubscriptionManagerProps) {
  // State to track if the component has mounted to handle effects correctly
  const [isMounted, setIsMounted] = useState(false);

  // Hook to access the current URL search parameters
  const searchParams = useSearchParams();

  // Hook to programmatically navigate between routes
  const router = useRouter();

  console.log("Subscription", subscription);

  // Set isMounted to true after initial render
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle subscription success or cancellation messages
  useEffect(() => {
    if (!isMounted) return;

    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Subscription successful! Welcome aboard!", {
        duration: 5000,
      });
      console.log("Subscription successful! Welcome aboard!");
      router.replace("/settings"); // Replace to remove query parameters
    } else if (canceled === "true") {
      toast.error(
        "Subscription canceled. If you change your mind, feel free to subscribe later!"
      );
      router.replace("/settings"); // Replace to remove query parameters
    }
  }, [searchParams, router, isMounted]);

  return (
    <div className="space-y-6 sm:space-y-6 lg:space-y-10">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
        Subscription Settings
      </h1>
      <SubscriptionBody subscription={subscription} />
    </div>
  );
}

export default SubscriptionManager;

/**
 * SubscriptionBody Component
 *
 * This component renders the main content of the subscription management page.
 * It displays either the current subscription details or options to subscribe.
 *
 * @param {Object} props - The props for the component.
 * @param {Stripe.Subscription | null} props.subscription - The user's current subscription status.
 * @returns {JSX.Element} The rendered SubscriptionBody component.
 */
function SubscriptionBody({
  subscription,
}: {
  subscription: Stripe.Subscription | null;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const subscriptionPrice = getSubscriptionPrice();
  const subscriptionCurrency = getSubscriptionCurrency();

  // Handle the checkout process
  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Checkout session creation failed:", errorData);
        throw new Error(
          `Failed to create checkout session: ${errorData.error}`
        );
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to initiate checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the subscription management portal
  const handleManageSubscription = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      const { url } = await response.json();
      router.push(url);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to open subscription management. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render active subscription details
  if (subscription && subscription.status === "active") {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-2 sm:space-y-6">
          <h3 className="text-lg sm:text-xl font-semibold">Your Plan</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Status: {getSubscriptionStatus(subscription)}
          </p>
          <p className="text-sm sm:text-base text-muted-foreground">
            {subscription.cancel_at
              ? `Access until: ${formatDate(subscription.current_period_end)}`
              : `Next billing date: ${formatDate(
                  subscription.current_period_end
                )}`}
          </p>
        </div>
        <Button
          onClick={handleManageSubscription}
          className="w-full sm:w-auto bg-green-100 text-green-600 border-2 border-green-200 hover:bg-green-200 hover:border-green-300"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Manage Subscription"}
        </Button>
      </div>
    );
  }

  // Render subscription options for non-subscribed users
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="space-y-2 sm:space-y-3">
        <h3 className="text-lg sm:text-xl font-semibold">Your Plan</h3>
        <p className="text-sm sm:text-base text-muted-foreground">
          You are using a Free plan.
        </p>
      </div>
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold">
          Subscription Features
        </h3>
        <ul className="space-y-3 sm:space-y-4">
          <li className="flex items-center space-x-3">
            <Star className="w-5 h-5 text-main flex-shrink-0" />
            <span className="text-sm sm:text-base">Unlimited Projects</span>
          </li>
          <li className="flex items-center space-x-3">
            <LayoutTemplate className="w-5 h-5 text-main flex-shrink-0" />
            <span className="text-sm sm:text-base">Unlimited Templates</span>
          </li>
          <li className="flex items-center space-x-3">
            <Box className="w-5 h-5 text-main flex-shrink-0" />
            <span className="text-sm sm:text-base">Unlimited Storage</span>
          </li>
        </ul>
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full sm:w-auto mt-4 sm:mt-6"
        >
          {isLoading
            ? "Processing..."
            : `Subscribe Now - ${subscriptionCurrency} ${subscriptionPrice.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}

/**
 * Get a formatted string representation of the subscription status.
 *
 * @param {Stripe.Subscription | null} subscription - The user's subscription object.
 * @returns {string} A formatted string describing the subscription status.
 */
const getSubscriptionStatus = (
  subscription: Stripe.Subscription | null
): string => {
  if (!subscription) return "No active subscription";
  if (subscription.status === "active" && subscription.cancel_at) {
    return "Canceled (Access until end of billing period)";
  }
  return (
    subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)
  );
};

/**
 * Format a Unix timestamp into a YYYY-MM-DD date string.
 *
 * @param {number} timestamp - The Unix timestamp to format.
 * @returns {string} A formatted date string in YYYY-MM-DD format.
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
