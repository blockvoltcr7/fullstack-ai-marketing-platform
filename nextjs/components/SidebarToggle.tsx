import { cn } from "@/lib/utils"; // Utility function for conditional class names
import React from "react"; // Importing React for component creation
import { Button } from "./ui/button"; // Importing a Button component from the UI library
import { ChevronLeft, ChevronRight } from "lucide-react"; // Importing icons for the toggle button

/**
 * Props for the SidebarToggle component.
 * @interface SidebarToggleProps
 * @property {boolean} isCollapsed - Indicates whether the sidebar is collapsed.
 * @property {() => void} toggleSidebar - Function to toggle the sidebar's open/closed state.
 */
interface SidebarToggleProps {
  isCollapsed: boolean; // State indicating if the sidebar is collapsed
  toggleSidebar: () => void; // Function to toggle the sidebar
}

/**
 * SidebarToggle component for toggling the sidebar's visibility.
 * This component renders a button that allows users to collapse or expand the sidebar.
 *
 * @param {SidebarToggleProps} props - The props for the component.
 * @returns {JSX.Element} The rendered SidebarToggle component.
 */
function SidebarToggle({
  isCollapsed,
  toggleSidebar,
}: SidebarToggleProps): JSX.Element {
  return (
    <div
      className={cn(
        "flex border-t border-gray-200", // Flex container with a top border
        isCollapsed ? "p-4 justify-center" : "p-4 justify-end" // Conditional padding and alignment based on collapse state
      )}
    >
      <Button
        variant="ghost" // Ghost variant for a subtle button style
        onClick={toggleSidebar} // Event handler for button click
        className={cn(
          "text-gray-800 hover:text-main hover:bg-gray-200", // Button styles with hover effects
          isCollapsed && "self-center" // Center the button if the sidebar is collapsed
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4" /> // Icon for expanding the sidebar
        ) : (
          <ChevronLeft className="h-4 w-4" /> // Icon for collapsing the sidebar
        )}
      </Button>
    </div>
  );
}

export default SidebarToggle; // Exporting the SidebarToggle component for use in other parts of the application
