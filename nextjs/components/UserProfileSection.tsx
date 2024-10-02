import React from "react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";

interface UsedrProfileSectionProps {
  isMobile: boolean;
  isCollapsed: boolean;
}

function UserProfileSection({
  isMobile,
  isCollapsed,
}: UsedrProfileSectionProps) {
  const { user } = useUser();

  return (
    <div
      className={cn(
        "flex items-center space-x-3 text-gray-700 hover:scale-[1.02] transition-all duration-300",
        !isMobile && isCollapsed ? "justify-center" : "justify-start"
      )}
    >
      <div
        className={cn(
          "p-4 border-t border-gray-200",
          !isMobile && isCollapsed ? "px-2" : "px-8"
        )}
      >
        <UserButton
          appearance={{ elements: { userButtonAvatarBox: "h-8 w-8" } }}
        />
        {(isMobile || !isCollapsed) && (
          <span className="text-md font-medium ml-2">
            {user?.username || user?.firstName || user?.fullName || "Profile"}
          </span>
        )}
      </div>
    </div>
  );
}

export default UserProfileSection;
