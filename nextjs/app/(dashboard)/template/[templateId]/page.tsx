import React from "react";

// This component is a server component by default in Next.js 13+
export default function TemplatePage({
  params,
}: {
  params: { templateId: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Template Page</h1>
      <p className="text-xl">
        Template ID: <span className="font-semibold">{params.templateId}</span>
      </p>
    </div>
  );
}

// Optionally, you can add TypeScript type checking for the params
export interface TemplatePageProps {
  params: {
    templateId: string;
  };
}
