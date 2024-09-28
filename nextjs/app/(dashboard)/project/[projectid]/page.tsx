"use client";

import React from "react";
import { useParams } from "next/navigation";

// Define an interface for the params
type Params = {
  projectid: string;
};

export default function ProjectPage() {
  const { projectid } = useParams<Params>();

  return <div>ProjectPage: {projectid}</div>;
}
