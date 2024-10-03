"use client"; // This component is a client component, allowing it to use React hooks and browser APIs.

import { Project } from "@/server/db/schema"; // Importing the Project type for type safety.
import React, { lazy, useEffect, useState } from "react"; // Importing necessary React hooks.
import ProjectDetailHeader from "./ProjectDetailHeader"; // Importing the header component for project details.
import ProjectDetailStepper from "./ProjectDetailStepper"; // Importing the stepper component for navigation.
import ConfirmationModal from "../ConfirmationModal"; // Importing the confirmation modal for delete actions.
import axios from "axios"; // Importing axios for making HTTP requests.
import toast from "react-hot-toast"; // Importing toast for displaying notifications.
import { useRouter, useSearchParams } from "next/navigation"; // Importing hooks for routing and search parameters.
import ProjectDetailBody from "./ProjectDetailBody"; // Importing the body component that displays project details.

const ManageUploadStep = lazy(() => import("../ManageUploadStep")); // Lazy loading the ManageUploadStep component.
const ConfigurePromptsStep = lazy(() => import("../ConfigurePromptsStep")); // Lazy loading the ConfigurePromptsStep component.
const GenerateContentStep = lazy(() => import("../GenerateContentStep")); // Lazy loading the GenerateContentStep component.

// Defining the steps for the project detail view, each with a name, tab identifier, and associated component.
const steps = [
  { name: "Upload Media", tab: "upload", component: ManageUploadStep },
  { name: "Prompts", tab: "prompts", component: ConfigurePromptsStep },
  { name: "Generate", tab: "generate", component: GenerateContentStep },
];

// Defining the props for the ProjectDetailView component.
interface ProjectDetailViewProps {
  project: Project; // The project object passed as a prop.
}

// Main component for displaying project details.
function ProjectDetailView({ project }: ProjectDetailViewProps) {
  const [isDeleting, setIsDeleting] = useState(false); // State to manage the deletion process.
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State to control the visibility of the delete confirmation modal.
  const searchParams = useSearchParams(); // Hook to access the current search parameters in the URL.

  // Function to find the index of the current step based on the tab identifier.
  const findStepIndex = (tab: string) => {
    const index = steps.findIndex((step) => step.tab === tab); // Finding the index of the step.
    return index === -1 ? 0 : index; // Return 0 if the tab is not found.
  };

  // State to manage the current step, initialized based on the search parameters.
  const [currentStep, setCurrentStep] = useState(
    findStepIndex(searchParams.get("tab") ?? "upload") // Default to "upload" if no tab is specified.
  );
  const router = useRouter(); // Hook to programmatically navigate.

  // Effect to update the current step when the search parameters change.
  useEffect(() => {
    const tab = searchParams.get("tab") ?? "upload"; // Get the current tab from search parameters.
    setCurrentStep(findStepIndex(tab)); // Update the current step index.
  }, [searchParams]);

  // Function to handle step clicks and navigate to the selected step.
  const handleStepClick = (index: number) => {
    router.push(`/project/${project.id}?tab=${steps[index].tab}`, {
      scroll: false, // Prevent scrolling to the top on navigation.
    });
  };

  // Function to handle project deletion.
  const handleDelete = async () => {
    setIsDeleting(true); // Set deleting state to true.
    try {
      await axios.delete(`/api/projects/${project.id}`); // Make a DELETE request to the API.
      toast.success("Project deleted successfully"); // Show success notification.
      router.push("/projects?deleted=true"); // Navigate back to the projects list.
    } catch (error) {
      console.error("Failed to delete project", error); // Log the error for debugging.
      toast.error("Failed to delete project. Please try again."); // Show error notification.
    } finally {
      setIsDeleting(false); // Reset deleting state.
      setShowDeleteConfirmation(false); // Close the delete confirmation modal.
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8 bg-white space-y-12">
      <ProjectDetailHeader
        project={project} // Pass the project object to the header.
        setShowDeleteConfirmation={setShowDeleteConfirmation} // Pass the function to control delete confirmation modal.
      />
      <ProjectDetailStepper
        currentStep={currentStep} // Current step index.
        handleStepClick={handleStepClick} // Function to handle step clicks.
        steps={steps} // Array of steps.
      />
      <ProjectDetailBody
        currentStep={currentStep} // Current step index.
        steps={steps} // Array of steps.
        projectId={project.id} // Project ID for the body component.
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation} // Control modal visibility.
        title="Delete Project" // Modal title.
        message="Are you sure you want to delete this project? This action cannot be undone." // Modal message.
        isLoading={isDeleting} // Show loading state while deleting.
        onClose={() => setShowDeleteConfirmation(false)} // Function to close the modal.
        onConfirm={handleDelete} // Function to confirm deletion.
      />
    </div>
  );
}

export default ProjectDetailView; // Exporting the component for use in other parts of the application.
