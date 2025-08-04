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
  id: string; // cuid from server
  projectId: string;
  notationContent: string;
  versionType: string; // e.g., 'auto'
  createdAt: Date;
  updatedAt: Date;
}