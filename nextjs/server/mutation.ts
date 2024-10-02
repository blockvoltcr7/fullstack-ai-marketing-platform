"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { projectsTable } from "./db/schema";

export async function createProject() {
  //  Figure out who the user is
  const { userId } = auth();

  // Verify the user exists
  if (!userId) {
    throw new Error("User not found");
  }

  // Create project in database
  const now = new Date();

  const [newProject] = await db
    .insert(projectsTable)
    .values({
      title: "New Project",
      userId,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return newProject;

  // TODO: LATER - redirect to detail view
  // redirect -> `/project/${newProject.id}`;
}
