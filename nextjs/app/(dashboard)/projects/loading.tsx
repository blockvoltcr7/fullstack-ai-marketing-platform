import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
      <p className="mt-4 text-lg font-semibold text-gray-700">
        Loading projects...
      </p>
    </div>
  );
}
