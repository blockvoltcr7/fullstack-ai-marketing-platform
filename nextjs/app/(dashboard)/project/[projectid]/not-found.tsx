import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-gray-800">
        Project Not Found
      </h1>
      <p className="text-xl text-gray-600 mb-6">
        Sorry, we couldn't find the project you're looking for.
      </p>
      <Link
        href="/projects"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Return to Projects
      </Link>
    </div>
  );
}
