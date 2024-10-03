"use client"; // This component is a client component, allowing it to use React hooks and browser APIs.

import { Project } from "@/server/db/schema"; // Importing the Project type for type safety.
import React, { Dispatch, SetStateAction, useState } from "react"; // Importing necessary React hooks.
import { Button } from "../ui/button"; // Importing the Button component for actions.
import { cn } from "@/lib/utils"; // Utility function for conditional class names.
import { CheckIcon, SquarePen, Trash2, X } from "lucide-react"; // Importing icons for UI.
import { Input } from "@/components/ui/input"; // Importing the Input component for text input.
import axios from "axios"; // Importing axios for making HTTP requests.
import toast from "react-hot-toast"; // Importing toast for displaying notifications.

interface ProjectDetailHeaderProps {
  project: Project; // The project object containing project details.
  setShowDeleteConfirmation: Dispatch<SetStateAction<boolean>>; // Function to control the visibility of the delete confirmation modal.
}

/**
 * ProjectDetailHeader component displays the project title and provides options to edit or delete the project.
 * It allows users to update the project title and confirm deletion.
 *
 * @param {ProjectDetailHeaderProps} props - The props for the component.
 * @returns {JSX.Element} The rendered header UI for the project details.
 */
function ProjectDetailHeader({
  project,
  setShowDeleteConfirmation,
}: ProjectDetailHeaderProps) {
  console.log("ProjectDetailHeader", project); // Logging the project details for debugging.

  const [title, setTitle] = useState(project.title); // State to manage the project title.
  const [isEditing, setIsEditing] = useState(false); // State to manage the editing mode.

  /**
   * Handles the submission of the updated project title.
   * Makes an API call to update the project title and handles success and error cases.
   */
  const handleTitleSubmit = async () => {
    try {
      const response = await axios.patch<Project>(
        `/api/projects/${project.id}`, // API endpoint to update the project.
        {
          title, // Updated title.
        }
      );

      setTitle(response.data.title); // Update the local title state with the response.
      toast.success("Project title updated successfully"); // Show success notification.
    } catch (error) {
      const defaultMessage =
        "Failed to update project title. Please try again."; // Default error message.

      console.error(error); // Log the error for debugging.

      if (axios.isAxiosError(error)) {
        console.log("IS AXIOS ERROR", error.response?.data); // Log the error response if it's an Axios error.
        const errorMessages = error.response?.data?.error?.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (detail: any) => detail?.message
        ) ?? [defaultMessage]; // Extract error messages or use the default message.

        errorMessages.forEach((msg: string) => toast.error(msg)); // Show each error message as a toast notification.
      } else {
        toast.error(defaultMessage); // Show the default error message.
      }
    } finally {
      setIsEditing(false); // Reset editing state after submission.
    }
  };

  // If in editing mode, render the input editor and action buttons.
  if (isEditing) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 space-x-0 sm:space-x-2 w-full">
        {/* INPUT EDITOR */}
        <Input
          value={title} // Controlled input for the project title.
          onChange={(e) => setTitle(e.target.value)} // Update title state on change.
          className="p-0 border-gray-100 bg-gray-50 text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 w-full focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {/* ACTION BUTTONS */}
        <Button
          onClick={handleTitleSubmit} // Submit the updated title.
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center"
        >
          <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
          {/* Check icon for submission */}
        </Button>
        <Button
          onClick={() => {
            setIsEditing(false); // Exit editing mode.
            setTitle(project.title); // Reset title to original project title.
          }}
          className="h-8 w-8 sm:h-10 sm:w-10 rounded-full p-0 bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
          {/* X icon for canceling edit */}
        </Button>
      </div>
    );
  }

  // If not editing, render the project title and action buttons.
  return (
    <div className="flex items-center justify-between md:justify-start md:space-x-2 w-full">
      {/* TITLE */}
      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate py-1">
        {title} {/* Display the project title */}
      </h1>
      {/* ACTIONS */}
      <div className="flex items-center space-x-2">
        <Button
          className={cn(
            "rounded-full p-0 bg-gray-100 text-gray-500 flex items-center justify-center",
            "h-8 w-8 sm:h-10 sm:w-10",
            "hover:text-main hover:bg-main/20"
          )}
          onClick={() => setIsEditing(true)} // Enter editing mode.
        >
          <SquarePen className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Edit icon */}
        </Button>
        <Button
          className={cn(
            "rounded-full p-0 bg-gray-100 text-gray-500 flex items-center justify-center",
            "h-8 w-8 sm:h-10 sm:w-10",
            "hover:text-red-600 hover:bg-red-50"
          )}
          onClick={() => setShowDeleteConfirmation(true)} // Show delete confirmation modal.
        >
          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />{" "}
          {/* Trash icon for deletion */}
        </Button>
      </div>
    </div>
  );
}

export default ProjectDetailHeader; // Exporting the component for use in other parts of the application.
