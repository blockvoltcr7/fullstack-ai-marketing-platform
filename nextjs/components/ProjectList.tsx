/**
 * ProjectList Component
 *
 * This component renders a list of projects as cards. Each card displays the project's title
 * and the time since it was last updated. The cards are wrapped in links that navigate to the
 * project's detail page.
 *
 * Props:
 * - projects: An array of Project objects, each containing details about a project.
 */

import { Project } from "@/server/db/schema"; // Importing the Project type for type safety
import React from "react"; // Importing React for component creation
import { Card, CardHeader, CardTitle } from "./ui/card"; // Importing UI components for card layout
import Link from "next/link"; // Importing Next.js Link component for client-side navigation
import { getTimeDifference } from "../utils/timeUtils"; // Importing utility function to calculate time difference

// Interface for the props accepted by the ProjectList component
interface ProjectListProps {
  projects: Project[]; // Array of Project objects
}

// ProjectList functional component
function ProjectList({ projects }: ProjectListProps) {
  return (
    <div className="grid gap-4 sm:gap-6 md:gap-8 lg:gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Mapping through the projects array to create a card for each project */}
      {projects.map((project) => (
        <Link key={project.id} href={`/project/${project.id}`}>
          {/* Card component for displaying project details */}
          <Card className="border border-gray-200 rounded-3xl p-3 hover:border-main hover:scale-[1.01] hover:shadow-md hover:text-main transition-all duration-300">
            <CardHeader className="pb-3 sm:pb-4 lg:pb-5 w-full">
              <CardTitle className="text-lg sm:text-xl lg:text-2xl truncate">
                {project.title} {/* Displaying the project title */}
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500 truncate">
                Updated {getTimeDifference(project.updatedAt)}{" "}
                {/* Displaying the last updated time */}
              </p>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default ProjectList; // Exporting the ProjectList component for use in other parts of the application
