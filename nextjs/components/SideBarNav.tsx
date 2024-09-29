import React from "react";

interface SideBarNavProps {
  isCollapsed: boolean;
  isMobile: boolean;
}

function SideBarNav({ isCollapsed, isMobile }: SideBarNavProps) {
  return <div className="space-y-4 overflow-hidden mb-auto">SideBarNav</div>;
}

export default SideBarNav;
