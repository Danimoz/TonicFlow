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
    this.version(3).stores({
      projects: 'id, title, subTitle, composer, arranger, keySignature, timeSignature, yearOfComposition, tempo, userId, createdAt, updatedAt',
      projectVersions: 'id, projectId, notationContent, versionType, createdAt, updatedAt',
      editorConfig: 'projectId, sidebarCollapsed, bpm, viewMode, pageLayout'
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
    if (!project)  return null;

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

    console.log("Retrieved preferences from IndexedDB:", preferences);
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
    // Verify the save by reading it back
    const saved = await db.editorConfig.get(projectId);
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

export async function createProjectVersion(projectId: string, notationContent: string, versionType: string = 'manual', unload: boolean = false): Promise<ProjectVersion> {
  try {
    const project = await db.projects.get(projectId);
    if (!project) throw new Error("Project not found in IndexedDB");
    await cleanUpVersionHistory(projectId);

    await db.projectVersions.where('projectId').equals(projectId).modify({ isCurrent: false });

    const newVersion: ProjectVersion = {
      id: crypto.randomUUID(),
      projectId,
      notationContent,
      versionType,
      isCurrent: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.projectVersions.add(newVersion);
    await syncVersionToBackend(newVersion, unload);
    return newVersion;
  } catch (error) {
    console.error("Error creating project version in IndexedDB (Dexie):", error);
    throw error; // Re-throw to allow calling component to handle
  }
}

async function cleanUpVersionHistory(projectId: string): Promise<void> {
  try {
    const versions = await db.projectVersions.where('projectId').equals(projectId).toArray();
    if (versions.length < 5) return; // No cleanup needed
    // get the oldest version
    const sortedVersions = versions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const oldestVersion = sortedVersions[0];
    await db.projectVersions.delete(oldestVersion!.id);
  } catch (error) {
    console.error("Error cleaning up version history:", error);
    throw error; // Re-throw to allow calling component to handle
  }
}

// Sync functions for backend integration
export async function syncVersionToBackend(version: ProjectVersion, unload = false): Promise<void> {
  try {
    if (unload) {
      navigator.sendBeacon('/api/sync/project-versions/' + version.projectId, JSON.stringify({
        notationContent: version.notationContent,
        versionType: version.versionType,
      }));
    } else {
      const response = await fetch(`/api/sync/project-versions/${version.projectId}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          notationContent: version.notationContent,
          versionType: version.versionType,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to sync version: ${response.statusText}`);
      }
      console.log(`Synced version ${version.id} of project ${version.projectId} to backend`);
    }
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