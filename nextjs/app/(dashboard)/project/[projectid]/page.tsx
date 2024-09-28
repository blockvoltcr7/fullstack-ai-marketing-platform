import React from "react";

// Define an interface for the params
type Params = {
  projectid: string;
};

// This component is a server component by default in Next.js 13+
export default function ProjectPage({ params }: { params: Params }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Project Page</h1>
      <p className="text-xl">
        Project ID: <span className="font-semibold">{params.projectid}</span>
      </p>
    </div>
  );
}

// Type checking for the params
export interface ProjectPageProps {
  params: Params;
}
