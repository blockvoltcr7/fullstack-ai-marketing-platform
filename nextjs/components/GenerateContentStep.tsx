"use client";

import React, { useEffect, useState } from "react";
import GenerateStepHeader from "./GenerateStepHeader";
import axios from "axios";
import { Asset, GeneratedContent, Prompt } from "@/server/db/schema";
import { MAX_TOKENS_ASSETS, MAX_TOKENS_PROMPT } from "@/lib/constants";
import toast from "react-hot-toast";
import GenerateStepBody from "./GenerateStepBody";

interface GenerateContentStepProps {
  projectId: string;
}

function GenerateContentStep({ projectId }: GenerateContentStepProps) {
  const [canGenerate, setCanGenerate] = useState(false);
  const [projectHasContent, setProjectHasContent] = useState(false);
  const [projectHasPrompts, setProjectHasPrompts] = useState(false);
  const [isAssetsTokenExceeded, setIsAssetsTokenExceeded] = useState(false);
  const [isPromptsTokenExceeded, setIsPromptsTokenExceeded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>(
    []
  );
  const [generatedCount, setGeneratedCount] = useState(0);
  const [totalPrompts, setTotalPrompts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const canGenerate =
      projectHasContent &&
      projectHasPrompts &&
      !isAssetsTokenExceeded &&
      !isPromptsTokenExceeded &&
      !isLoading &&
      !isGenerating;

    setCanGenerate(canGenerate);
  }, [
    isAssetsTokenExceeded,
    isGenerating,
    isLoading,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  useEffect(() => {
    const fetchAllProjectData = async () => {
      setIsLoading(true);
      console.log(
        `[GenerateContentStep] Fetching data for project ${projectId}`
      );

      try {
        const [generatedContentResponse, assetsResponse, promptsResponse] =
          await Promise.all([
            axios.get<GeneratedContent[]>(
              `/api/projects/${projectId}/generated-content`
            ),
            axios.get<Asset[]>(`/api/projects/${projectId}/assets`),
            axios.get<Prompt[]>(`/api/projects/${projectId}/prompts`),
          ]);

        console.log(
          `[GenerateContentStep] Generated content:`,
          generatedContentResponse.data
        );
        console.log(`[GenerateContentStep] Assets:`, assetsResponse.data);
        console.log(`[GenerateContentStep] Prompts:`, promptsResponse.data);

        setGeneratedContent(generatedContentResponse.data);
        setGeneratedCount(generatedContentResponse.data.length);

        const hasValidContent = assetsResponse.data.some(
          (asset) => asset.content && asset.content.trim().length > 0
        );
        console.log(
          `[GenerateContentStep] Project has valid content: ${hasValidContent}`
        );
        setProjectHasContent(hasValidContent);

        if (!hasValidContent) {
          console.log(
            `[GenerateContentStep] Assets without valid content:`,
            assetsResponse.data.filter(
              (asset) => !asset.content || asset.content.trim().length === 0
            )
          );
        }

        const hasPrompts = promptsResponse.data.length > 0;
        console.log(`[GenerateContentStep] Project has prompts: ${hasPrompts}`);
        setProjectHasPrompts(hasPrompts);
        setTotalPrompts(promptsResponse.data.length);

        // Check to make sure we don't exceed asset token limits
        let totalTokenCount = 0;
        for (const asset of assetsResponse.data) {
          totalTokenCount += asset.tokenCount ?? 0;
        }
        const assetsExceedTokens = totalTokenCount > MAX_TOKENS_ASSETS;
        console.log(
          `[GenerateContentStep] Total asset tokens: ${totalTokenCount}, Limit: ${MAX_TOKENS_ASSETS}, Exceeded: ${assetsExceedTokens}`
        );
        setIsAssetsTokenExceeded(assetsExceedTokens);

        // Check to make sure we don't exceed prompt token limits
        let promptsExceedTokens = false;
        for (const prompt of promptsResponse.data) {
          if ((prompt?.tokenCount ?? 0) > MAX_TOKENS_PROMPT) {
            promptsExceedTokens = true;
            console.log(
              `[GenerateContentStep] Prompt exceeds token limit:`,
              prompt
            );
            break;
          }
        }
        console.log(
          `[GenerateContentStep] Prompts exceed token limit: ${promptsExceedTokens}`
        );
        setIsPromptsTokenExceeded(promptsExceedTokens);
      } catch (error) {
        console.error(
          `[GenerateContentStep] Error fetching project data:`,
          error
        );
        if (axios.isAxiosError(error)) {
          console.error(`[GenerateContentStep] Axios error details:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
        }
        toast.error("Failed to fetch project data");
        setProjectHasContent(false);
        setProjectHasPrompts(false);
      } finally {
        setIsLoading(false);
        console.log(
          `[GenerateContentStep] Finished fetching data for project ${projectId}`
        );
      }
    };

    fetchAllProjectData();
  }, [projectId]);

  useEffect(() => {
    let newErrorMessage = null;

    if (!projectHasContent && !projectHasPrompts) {
      newErrorMessage =
        "Please add valid assets and prompts before generating content.";
    } else if (!projectHasContent) {
      newErrorMessage = "Please add valid assets before generating content.";
    } else if (!projectHasPrompts) {
      newErrorMessage = "Please add prompts before generating content.";
    } else if (isAssetsTokenExceeded || isPromptsTokenExceeded) {
      const exceededItems = [];
      if (isAssetsTokenExceeded) exceededItems.push("assets");
      if (isPromptsTokenExceeded) exceededItems.push("prompts");

      newErrorMessage = `Your ${exceededItems.join(
        " and "
      )} exceed the maximum token limit. Please reduce the size of your ${exceededItems.join(
        " or "
      )}.`;
    }

    setErrorMessage(newErrorMessage);
    console.log("[GenerateContentStep] Error message set:", newErrorMessage);
    console.log("[GenerateContentStep] Project state:", {
      projectHasContent,
      projectHasPrompts,
      isAssetsTokenExceeded,
      isPromptsTokenExceeded,
    });
  }, [
    isAssetsTokenExceeded,
    isPromptsTokenExceeded,
    projectHasContent,
    projectHasPrompts,
  ]);

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout;

    const fetchGeneratedContent = async () => {
      try {
        const response = await axios.get<GeneratedContent[]>(
          `/api/projects/${projectId}/generated-content`
        );

        setGeneratedContent(response.data);
        setGeneratedCount(response.data.length);

        if (response.data.length === totalPrompts) {
          clearInterval(pollingInterval);
          setIsGenerating(false);
          toast.success("Content generation complete");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch generated content");
      }
    };

    if (isGenerating) {
      pollingInterval = setInterval(() => {
        fetchGeneratedContent();
      }, 1000);
    }

    // Clean up
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isGenerating, projectId, totalPrompts]);

  const startGeneration = async () => {
    setGeneratedContent([]);
    setGeneratedCount(0);
    try {
      await axios.delete(`/api/projects/${projectId}/generated-content`);
      setIsGenerating(true);

      await axios.post<GeneratedContent[]>(
        `/api/projects/${projectId}/generated-content`
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate content");
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <GenerateStepHeader
        canGenerateContent={canGenerate}
        startGeneration={startGeneration}
      />
      <GenerateStepBody
        isLoading={isLoading}
        isGenerating={isGenerating}
        generatedCount={generatedCount}
        totalPrompts={totalPrompts}
        errorMessage={errorMessage}
        generatedContent={generatedContent}
        projectId={projectId}
        setGeneratedContent={setGeneratedContent}
      />
    </div>
  );
}

export default GenerateContentStep;
