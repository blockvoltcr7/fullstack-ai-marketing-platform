import Sidebar from "@/components/Sidebar";

/**
 * DashboardLayout component serves as the main layout for the dashboard.
 * It includes a sidebar for navigation and a main content area for displaying
 * child components.
 *
 * @param {Object} props - The props for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered
 * within the main content area.
 * @returns {JSX.Element} The rendered DashboardLayout component.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Sidebar component for navigation */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 max-h-screen p-4 sm:p-6 md:p-8 lg:p-6 pt-16 lg:pt-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}

/**
 * CSS Class Names Explanation:
 * - flex: Applies a flexbox layout to the container.
 * - flex-col: Arranges child elements in a column direction by default.
 * - lg:flex-row: Changes the direction to row on large screens (lg) and above.
 * - min-h-screen: Sets the minimum height of the container to the full height of the viewport.
 * - bg-white: Sets the background color of the container to white.
 *
 * For the main element:
 * - flex-1: Allows the main content area to grow and fill the available space.
 * - max-h-screen: Limits the maximum height of the main content area to the height of the viewport.
 * - p-4, sm:p-6, md:p-8, lg:p-6: Applies padding that adjusts based on screen size (responsive design).
 * - pt-16: Applies top padding of 16 units to create space for the fixed sidebar.
 * - lg:pt-8: Reduces the top padding to 8 units on large screens and above.
 * - overflow-auto: Enables scrolling if the content exceeds the height of the main area.
 */
