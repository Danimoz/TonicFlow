import { EditorPreferences } from "@/contexts/types"

export interface Project {
  id: string
  title: string
  userId: string
  subTitle?: string
  composer?: string
  arranger?: string
  keySignature?: string
  timeSignature?: string
  yearOfComposition?: string
  tempo?: string
  createdAt: string
  updatedAt: string
  
  currentVersion?: ProjectVersion
  preferences?: EditorPreferences
}

export interface ProjectsResponse {
  projects: Project[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  notationContent: string;
  versionType: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EditorState {
  projectId: string;
  preferences: EditorPreferences;
  solfaText?: string;
}