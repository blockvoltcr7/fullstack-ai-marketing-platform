"server-only";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import {
  Project,
  projectsTable,
  Template,
  templatesTable,
  subscriptionsTable,
  stripeCustomersTable,
} from "./db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import stripe from "@/lib/stripe";

export function getProjectsForUser(): Promise<Project[]> {
  // Figure out who the user is
  const { userId } = auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch projects from database
  const projects = db.query.projectsTable.findMany({
    where: eq(projectsTable.userId, userId),
    orderBy: (projects, { desc }) => [desc(projects.updatedAt)],
  });

  return projects;
}

export async function getProject(projectId: string) {
  console.log(`getProject: Received projectId: ${projectId}`);

  if (!projectId) {
    console.error("getProject: Project ID is undefined or empty");
    return null;
  }

  // Figure out who the user is
  const { userId } = auth();

  console.log(`getProject: Authenticated userId: ${userId}`);

  // Verify the user exists
  if (!userId) {
    console.error("getProject: User not found");
    throw new Error("User not found");
  }

  console.log(`getProject: Fetching project ${projectId} for user ${userId}`);

  try {
    const project = await db.query.projectsTable.findFirst({
      where: (project, { eq, and }) =>
        and(eq(project.id, projectId), eq(project.userId, userId)),
    });

    if (!project) {
      console.error(
        `getProject: Project ${projectId} not found for user ${userId}`
      );
    } else {
      console.log(`getProject: Project ${projectId} found for user ${userId}`);
      console.log(
        `getProject: Verifying project details:`,
        JSON.stringify(project, null, 2)
      );
    }

    return project;
  } catch (error) {
    console.error(`getProject: Error fetching project:`, error);
    throw error;
  }
}

export async function getTemplatesForUser(): Promise<Template[]> {
  // Figure out who the user is
  const { userId } = auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch templates from database
  const projects = await db.query.templatesTable.findMany({
    where: eq(templatesTable.userId, userId),
    orderBy: (templates, { desc }) => [desc(templates.updatedAt)],
  });

  return projects;
}

export async function getTemplate(id: string): Promise<Template | undefined> {
  // Figure out who the user is
  const { userId } = auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  const template = await db.query.templatesTable.findFirst({
    where: (template, { eq, and }) =>
      and(eq(template.id, id), eq(template.userId, userId)),
  });

  return template;
}

export async function getUserSubscription(): Promise<Stripe.Subscription | null> {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not found");
  }

  try {
    const subscription = await db.query.subscriptionsTable.findFirst({
      where: eq(subscriptionsTable.userId, userId),
    });

    if (!subscription) {
      console.log("No stripe subscription found for user", userId);
      return null;
    }

    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    return stripeSubscription;
  } catch (error) {
    // If the subscription doesn't exist or there's an error, log it and return null
    if (
      error instanceof Stripe.errors.StripeError &&
      error.code === "resource_missing"
    ) {
      console.log("Subscription not found in Stripe.");
      return null;
    }

    console.error("Error fetching subscription from Stripe:", error);
    throw new Error("Failed to retrieve subscription details.");
  }
}

export async function deleteUser(userId: string): Promise<void> {
  // Verify the user exists
  const { userId: authUserId } = auth();
  if (!authUserId) {
    throw new Error("Unauthorized");
  }

  await db.transaction(async (tx) => {
    // Delete from the subscriptions table first
    await tx
      .delete(subscriptionsTable)
      .where(eq(subscriptionsTable.userId, userId));

    // Delete from the stripe_customers table
    await tx
      .delete(stripeCustomersTable)
      .where(eq(stripeCustomersTable.userId, userId));
  });

  console.log(
    `User ${userId} has been deleted from subscriptions and stripe_customers tables.`
  );
}
