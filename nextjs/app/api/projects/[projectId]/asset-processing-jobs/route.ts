import { db } from "@/server/db";
import { assetProcessingJobTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params;
  console.log(`[API] Fetching asset processing jobs for project ${projectId}`);

  // Auth check
  const { userId } = getAuth(request);
  if (!userId) {
    console.log(`[API] Unauthorized access attempt for project ${projectId}`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const jobs = await db
      .select()
      .from(assetProcessingJobTable)
      .where(eq(assetProcessingJobTable.projectId, projectId))
      .execute();

    console.log(
      `[API] Found ${jobs.length} asset processing jobs for project ${projectId}`
    );
    console.log(`[API] Jobs:`, jobs);

    return NextResponse.json(jobs);
  } catch (error) {
    console.error(
      `[API] Error fetching asset processing jobs for project ${projectId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch asset processing jobs" },
      { status: 500 }
    );
  }
}
