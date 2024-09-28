"use client";

import React from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
// Define an interface for the params
type Params = {
  projectid: string;
};

export default function ProjectPage() {
  const { projectid } = useParams<Params>();

  return (
    <div className="flex flex-row">
      <Sidebar />
      <div className="flex-1">ProjectPage: {projectid}</div>
    </div>
  );
}
