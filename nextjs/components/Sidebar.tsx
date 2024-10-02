"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import SidebarNav from "./SideBarNav";
import SidebarToggle from "./SidebarToggle";
import { useUser } from "@clerk/nextjs";
import UserProfileSection from "./UserProfileSection";

// Define the breakpoint for mobile devices
const MOBILE_WINDOW_WIDTH_LIMIT = 1024;

/**
 * Sidebar component for the AI Marketing Platform
 *
 * This component renders a responsive sidebar that adapts to both mobile and desktop views.
 * It includes navigation items, a toggle for collapsing/expanding, and handles outside clicks.
 *
 * @returns {JSX.Element} The rendered Sidebar component
 */
function Sidebar() {
  // State variables
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { isSignedIn } = useUser();

  // useRef is a React hook that returns a mutable ref object whose .current property is initialized to the passed argument (in this case, null).
  // It can be used to access a DOM element directly, allowing for imperative actions such as focusing an input or measuring the size of an element.
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle window resize and set initial state
  /**
   * useEffect hook to handle window resizing and determine the sidebar's state.
   *
   * This effect runs once on component mount and sets up an event listener for
   * window resize events. It checks if the current window width is less than
   * the defined MOBILE_WINDOW_WIDTH_LIMIT to determine if the sidebar should
   * be in mobile mode. The sidebar's state is updated accordingly:
   *
   * - If the window width is less than the limit, it sets `isMobile` to true
   *   and ensures the sidebar is not collapsed by setting `isCollapsed` to false.
   * - If the window width is greater than or equal to the limit, it sets
   *   `isOpen` to false, closing the sidebar if it was open.
   *
   * The effect also sets `isMounted` to true to indicate that the component
   * has been mounted and is ready for interaction. The cleanup function
   * removes the event listener when the component unmounts to prevent memory
   * leaks and ensure optimal performance.
   */
  useEffect(() => {
    const handleResize = () => {
      const calculatedIsMobile = window.innerWidth < MOBILE_WINDOW_WIDTH_LIMIT;
      setIsMobile(calculatedIsMobile);
      if (calculatedIsMobile) {
        setIsCollapsed(false);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle clicks outside the sidebar to close it on mobile
  /**
   * useEffect hook to handle clicks outside the sidebar.
   * This effect listens for mouse down events on the window and checks if the click
   * occurred outside the sidebar. If the sidebar is open and the user clicks outside,
   * it will close the sidebar.
   *
   * Dependencies:
   * - isMobile: Indicates whether the sidebar is in mobile mode.
   * - isOpen: Indicates whether the sidebar is currently open.
   *
   * The effect sets up an event listener for 'mousedown' events when the component mounts,
   * and cleans up the listener when the component unmounts or when the dependencies change.
   */
  useEffect(() => {
    // Function to handle outside click events
    const handleOutsideClick = (event: MouseEvent) => {
      // Check if the sidebar reference exists and if the click target is not within the sidebar
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        // If in mobile mode and the sidebar is open, close the sidebar
        if (isMobile && isOpen) {
          setIsOpen(false);
        }
      }
    };

    // Add event listener for mouse down events on the window
    window.addEventListener("mousedown", handleOutsideClick);

    // Cleanup function to remove the event listener when the component unmounts or dependencies change
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMobile, isOpen]);

  /**
   * Toggle the sidebar open/closed state
   */
  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  /**
   * Render the appropriate menu icon based on the sidebar state
   * @param {boolean} isOpen - Whether the sidebar is open
   * @returns {JSX.Element} The menu icon component
   */
  const renderMenuIcon = (isOpen: boolean) => {
    return isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />;
  };

  return (
    <div>
      {/* Mobile toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className={cn(
            "fixed top-4 left-4 z-50 bg-transparent hover:bg-gray-100/50 backdrop-blur-sm",
            isOpen && "top-4 left-4"
          )}
        >
          {renderMenuIcon(isOpen)}
        </Button>
      )}

      {/* Sidebar content */}
      {(!isMobile || isOpen) && (
        <div
          ref={sidebarRef}
          className={cn(
            "bg-gray-100 flex flex-col h-screen transition-all duration-300 overflow-y-auto",
            // Mobile styles
            !isMobile
              ? ""
              : `fixed inset-y-0 left-0 z-40 w-64 transform ${
                  isOpen ? "translate-x-0" : "translate-x-full"
                }`,
            // Desktop styles
            isMobile
              ? ""
              : isCollapsed
                ? "w-28 h-screen sticky top-0"
                : "w-64 h-screen sticky top-0"
          )}
        >
          <div
            className={cn(
              "flex flex-col flex-grow p-6",
              isMobile ? "pt-16" : "pt-10"
            )}
          >
            {/* Sidebar title */}
            {!isCollapsed && (
              <h1 className="text-4xl font-bold mb-10">
                AI Marketing Platform
              </h1>
            )}

            {/* Navigation items */}
            <SidebarNav isMobile={isMobile} isCollapsed={isCollapsed} />
          </div>

          {/* Placeholder for user profile */}
          <div></div>

          {isSignedIn && (
            <UserProfileSection isMobile={isMobile} isCollapsed={isCollapsed} />
          )}

          {/* Desktop sidebar toggle */}
          {!isMobile && (
            <SidebarToggle
              isCollapsed={isCollapsed}
              toggleSidebar={toggleSidebar}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
