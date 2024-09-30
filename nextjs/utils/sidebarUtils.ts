/**
 * Generates CSS classes for the mobile sidebar.
 * @param {Object} params - The parameters for generating mobile classes.
 * @param {boolean} params.isMobile - Indicates if the device is mobile.
 * @param {boolean} params.isOpen - Indicates if the sidebar is open.
 * @returns {string} The CSS classes for the mobile sidebar.
 */
export const getMobileClasses = ({
  isMobile,
  isOpen,
}: {
  isMobile: boolean;
  isOpen: boolean;
}): string => {
  // Return empty string if not mobile
  if (!isMobile) return "";

  // Base classes for mobile sidebar
  // Define base classes for the mobile sidebar
  // - fixed: Positions the sidebar fixed on the screen
  // - inset-y-0: Stretches the sidebar vertically from top to bottom
  // - left-0: Aligns the sidebar to the left edge of the screen
  // - z-40: Sets a high z-index to ensure the sidebar appears above other content
  // - w-64: Sets the width of the sidebar to 64 units (typically 16rem or 256px)
  // - transform: Enables CSS transforms for smooth transitions
  const baseClasses = "fixed inset-y-0 left-0 z-40 w-64 transform";

  // Return classes based on sidebar open state
  return isOpen
    ? `${baseClasses} translate-x-0` // Sidebar visible
    : `${baseClasses} translate-x-full`; // Sidebar hidden
};

/**
 * Generates CSS classes for the desktop sidebar.
 * @param {Object} params - The parameters for generating desktop classes.
 * @param {boolean} params.isMobile - Indicates if the device is mobile.
 * @param {boolean} params.collapsed - Indicates if the sidebar is collapsed.
 * @returns {string} The CSS classes for the desktop sidebar.
 */
export const getDesktopClasses = ({
  isMobile,
  isCollapsed,
}: {
  isMobile: boolean;
  isCollapsed: boolean;
}): string => {
  // Return empty string if mobile
  if (isMobile) return "";

  // Return classes based on sidebar collapsed state
  return isCollapsed
    ? "w-28 h-screen sticky top-0" // Collapsed sidebar
    : "w-64 h-screen sticky top-0"; // Expanded sidebar
};
