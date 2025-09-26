'use client';

import { useCallback, useState } from "react";
import { EditorState } from "@/contexts/types";
import { getProjectFromIndexedDB, addProjectToIndexedDb } from "@/lib/dexie";
import { getProjectById } from "@/app/(dashboard)/actions";
import { getPreferencesFromProject } from "@/lib/editorUtils";
import { Project } from "@/app/(dashboard)/types";

export function useProjectLoader() {
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInitialEditorState = useCallback((project: Project): EditorState => ({
    projectId: project.id,
    preferences: getPreferencesFromProject(project),
    solfaText: project.currentVersion?.notationContent || undefined,
    isPlaying: false,
  }), []);

  const handleError = useCallback((error: unknown, context: string) => {
    console.error(`Error occurred in ${context}:`, error);
    setError(`Failed to ${context}. Please try again.`);
  }, []);

  const loadProject = useCallback(async (projectId: string) => {
    try {
      const project = await getProjectById(projectId);
      if (!project) throw new Error("Project not found");
      const indexedProject = await getProjectFromIndexedDB(projectId);
      if (!indexedProject) {
        await addProjectToIndexedDb(project);
      }
      setProject(project);
      return { project, indexedProject };
    } catch (error) {
      handleError(error, "load project");
      throw error;
    }
  }, [handleError]);

  const loadProjectFromSession = useCallback((projectId: string) => {
    const newProjectJSON = sessionStorage.getItem("newProject");
    if (newProjectJSON) {
      const newProject = JSON.parse(newProjectJSON);
      if (newProject && newProject.id === projectId) {
        setProject(newProject);
        sessionStorage.removeItem("newProject");
        return newProject;
      }
    }
    return null;
  }, []);

  return {
    project,
    setProject,
    isLoading,
    setIsLoading,
    error,
    setError,
    createInitialEditorState,
    loadProject,
    loadProjectFromSession
  };
}