import { Project, ProjectVersion } from "@/app/(dashboard)/types";
import { EditorPreferences } from "@/contexts/types";
import Dexie, { EntityTable } from "dexie";
import { getPreferencesFromProject } from "./editorUtils";


export class TonicFlowDatabase extends Dexie {
  projects!: EntityTable<Project, 'id'>;
  projectVersions!: EntityTable<ProjectVersion, 'id'>;
  editorConfig!: EntityTable<EditorPreferences & { projectId: string }, 'projectId'>;

  constructor() {
    super('TonicFlowDB')
    this.version(2).stores({
      projects: 'id, title, subTitle, composer, arranger, keySignature, timeSignature, yearOfComposition, tempo, userId, createdAt, updatedAt',
      projectVersions: 'id, projectId, notationContent, versionType, createdAt, updatedAt',
      editorConfig: 'projectId, sidebarCollapsed, bpm, keySignature, timeSignature, viewMode, pageLayout'
    });
  }
}


export const db = new TonicFlowDatabase();

// Project operations
export async function addProjectToIndexedDb(project: Project): Promise<void> {
  const { currentVersion, ...projectData } = project;
  const preferences = getPreferencesFromProject(project);
  try {
    await db.transaction('rw', db.projects, db.projectVersions, db.editorConfig, async () => {
      await db.projects.add(projectData)
      await db.projectVersions.add(currentVersion as ProjectVersion)
      await db.editorConfig.add({ projectId: project.id, ...preferences })
    });
    console.log("Project added to IndexedDB (Dexie):", project.id)
  } catch (error) {
    console.error("Error adding project to IndexedDB (Dexie):", error)
    throw error // Re-throw to allow calling component to handle
  }
}

export async function getProjectFromIndexedDB(projectId: string): Promise<Project | null> {
  try {
    const project = await db.projects.get(projectId);
    if (!project) {
      return null;
    }

    const currentVersion = await db.projectVersions.where('projectId').equals(projectId).and(version => version.isCurrent === true).first();
    if (!currentVersion) {
      console.error("No version found for project:", projectId);
      return null;
    }

    const preferences = await db.editorConfig.get(projectId);
    if (!preferences) {
      console.error("No editor config found for project:", projectId);
      return null;
    }

    return { ...project, currentVersion, preferences };
  } catch (error) {
    console.error("Error getting project from IndexedDB:", error);
    return null;
  }
}

export async function saveProjectToIndexedDB(project: Project): Promise<void> {
  try {
    const { currentVersion, preferences, ...projectData } = project;
    await db.projects.put(projectData);
    console.log("Project saved to IndexedDB (Dexie):", project.id);
  } catch (error) {
    console.error("Error saving project to IndexedDB (Dexie):", error);
    throw error; // Re-throw to allow calling component to handle
  }
}

export async function savePreferencesToIndexedDB(projectId: string, preferences: EditorPreferences): Promise<void> {
  try {
    await db.editorConfig.put({ projectId, ...preferences });
    console.log("Preferences saved to IndexedDB (Dexie) for project:", projectId);
  } catch (error) {
    console.error("Error saving preferences to IndexedDB (Dexie):", error);
    throw error; // Re-throw to allow calling component to handle
  }
}

export async function saveSolfaTextToIndexedDB(projectId: string, solfaText: string): Promise<void> {
  try {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error("Project not found in IndexedDB");

    const currentVersion = await db.projectVersions
      .where('projectId')
      .equals(projectId)
      .and(version => version.isCurrent === true)
      .first();
    if (!currentVersion) throw new Error("Current version not found in IndexedDB");

    currentVersion.notationContent = solfaText;
    currentVersion.updatedAt = new Date();
    await db.projectVersions.put(currentVersion);

    console.log("Solfa text saved to IndexedDB (Dexie) for project:", projectId);
  } catch (error) {
    console.error("Error saving solfa text to IndexedDB (Dexie):", error);
    throw error; // Re-throw to allow calling component to handle
  }
}

// Sync functions for backend integration
export async function syncVersionToBackend(version: ProjectVersion): Promise<void> {
  try {
    const response = await fetch(`/api/projects/${version.projectId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(version),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync version: ${response.statusText}`);
    }

    console.log(`Synced version ${version.id} to backend`);
  } catch (error) {
    console.error('Error syncing version to backend:', error);
    throw error;
  }
}

export async function syncProjectToBackend(project: Project): Promise<void> {
  try {
    const { currentVersion, preferences, ...projectData } = project;

    const response = await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      throw new Error(`Failed to sync project: ${response.statusText}`);
    }

    console.log(`Synced project ${project.id} to backend`);
  } catch (error) {
    console.error('Error syncing project to backend:', error);
    throw error;
  }
}