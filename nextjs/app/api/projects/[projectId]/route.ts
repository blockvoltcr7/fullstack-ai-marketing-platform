import { db } from "@/server/db"; // Importing the database instance for querying.
import { projectsTable } from "@/server/db/schema"; // Importing the schema for the projects table.
import { getAuth } from "@clerk/nextjs/server"; // Importing authentication utility from Clerk.
import { and, eq } from "drizzle-orm"; // Importing query helpers from Drizzle ORM.
import { NextRequest, NextResponse } from "next/server"; // Importing Next.js request and response types.
import { z } from "zod"; // Importing Zod for schema validation.

// Schema definition for updating a project, ensuring the title is a non-empty string.
const updateProjectSchema = z.object({
  title: z.string().min(1), // Title must be a string with a minimum length of 1.
});

/**
 * Handles the PATCH request to update a project title.
 *
 * @param {NextRequest} request - The incoming request object.
 * @param {Object} params - The parameters object containing the projectId.
 * @returns {Promise<NextResponse>} - Returns a JSON response with the updated project or an error message.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { userId } = getAuth(request); // Retrieve the authenticated user's ID from the request.

  // Check if the user is authenticated; if not, return a 401 Unauthorized response.
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json(); // Parse the request body as JSON.
  const validatedData = updateProjectSchema.safeParse(body); // Validate the incoming data against the schema.

  // If validation fails, return a 400 Bad Request response with error details.
  if (!validatedData.success) {
    return NextResponse.json(
      { error: validatedData.error.errors },
      { status: 400 }
    );
  }

  const { title } = validatedData.data; // Extract the validated title from the data.

  // Update the project in the database where the userId and projectId match.
  const updatedProject = await db
    .update(projectsTable)
    .set({ title }) // Set the new title for the project.
    .where(
      and(
        eq(projectsTable.userId, userId), // Ensure the project belongs to the authenticated user.
        eq(projectsTable.id, params.projectId) // Match the project ID from the request parameters.
      )
    )
    .returning(); // Return the updated project data.

  // If no project was updated, return a 404 Not Found response.
  if (updatedProject.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Return the updated project as a JSON response.
  return NextResponse.json(updatedProject[0]);
}

/**
 * Handles the DELETE request to remove a project.
 *
 * @param {NextRequest} request - The incoming request object.
 * @param {Object} params - The parameters object containing the projectId.
 * @returns {Promise<NextResponse>} - Returns a JSON response with the deleted project or an error message.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { userId } = getAuth(request); // Retrieve the authenticated user's ID from the request.

  // Check if the user is authenticated; if not, return a 401 Unauthorized response.
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Delete the project from the database where the userId and projectId match.
  const deletedProject = await db
    .delete(projectsTable)
    .where(
      and(
        eq(projectsTable.userId, userId), // Ensure the project belongs to the authenticated user.
        eq(projectsTable.id, params.projectId) // Match the project ID from the request parameters.
      )
    )
    .returning(); // Return the deleted project data.

  // If no project was deleted, return a 404 Not Found response.
  if (deletedProject.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Return the deleted project as a JSON response.
  return NextResponse.json(deletedProject[0]);
}
