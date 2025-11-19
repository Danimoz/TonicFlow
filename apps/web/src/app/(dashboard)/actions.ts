"use server"

import { requireAuth } from "@/lib/auth"
import { fetcher, handleServerError } from "@/lib/fetcher"
import { redirect } from "next/navigation"
import { Project, ProjectsResponse } from "./types"

interface CreateProjectResult {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string>
  project?: Project
}

/**
 * Creates a new project
 * @param formData - Form data containing project details
 * @returns CreateProjectResult - Result of the creation operation
 */
export async function createProject(formData: FormData): Promise<CreateProjectResult> {
  await requireAuth()

  const title = formData.get("title") as string
  const subTitle = formData.get("subTitle") as string
  const composer = formData.get("composer") as string
  const arranger = formData.get("arranger") as string
  const keySignature = formData.get("keySignature") as string
  const timeSignature = formData.get("timeSignature") as string
  const yearOfComposition = formData.get("yearOfComposition") as string
  const tempo = formData.get("tempo") as string
  const initialNotationContent = formData.get("initialNotationContent") as string

  // Server-side validation
  const fieldErrors: Record<string, string> = {}
  if (!title?.trim()) fieldErrors.title = "Title is required"
  if (Object.keys(fieldErrors).length > 0) return { success: false, fieldErrors }

  try {
    const project = await fetcher(`${process.env.BACKEND_BASE_URL}/projects`, {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        subTitle: subTitle?.trim() || undefined,
        composer: composer?.trim() || undefined,
        arranger: arranger?.trim() || undefined,
        keySignature: keySignature?.trim() || undefined,
        timeSignature: timeSignature?.trim() || undefined,
        yearOfComposition: yearOfComposition?.trim() || undefined,
        tempo: tempo?.trim() || undefined,
        initialNotationContent: initialNotationContent?.trim() || undefined,
      })
    })
    return { success: true, project }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "Unauthorized") redirect("/login")
      // Check if error has fieldErrors (from fetcher)
      if ((error as any).fieldErrors) return { success: false, fieldErrors: (error as any).fieldErrors }
      return { success: false, error: error.message }
    }

    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function createProjectVersion(projectId: string, notationContent: string, versionType: string = 'manual'){
  await requireAuth()

  try {
    const version = await fetcher(`${process.env.BACKEND_BASE_URL}/projects/${projectId}/versions`, {
      method: "POST",
      body: JSON.stringify({ notationContent, versionType })
    })
    if (!version) throw new Error("Failed to create project version");

    return { version, success: true }
  } catch (error) {
    return handleServerError(error);
  }
}

export async function getProjects(options?: {
  page?: number
  limit?: number
  search?: string
  sortBy?: 'title' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}): Promise<ProjectsResponse> {
  await requireAuth()

  const searchParams = new URLSearchParams()

  if (options?.page) searchParams.set('page', options.page.toString())
  if (options?.limit) searchParams.set('limit', options.limit.toString())
  if (options?.search) searchParams.set('search', options.search)
  if (options?.sortBy) searchParams.set('sortBy', options.sortBy)
  if (options?.sortOrder) searchParams.set('sortOrder', options.sortOrder)

  const url = `${process.env.BACKEND_BASE_URL}/projects${searchParams.toString() ? `?${searchParams}` : ''}`

  try {
    const response = await fetcher(url, {
      cache: "no-store"
    })

    return response as ProjectsResponse
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login")
    }
    return {
      projects: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    }
  }
}

export async function getProjectById(projectId: string): Promise<Project | null> {
  await requireAuth()
  try {
    const project = await fetcher(`${process.env.BACKEND_BASE_URL}/projects/${projectId}`, {
      cache: "no-store"
    })

    return project as Project
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      redirect("/login")
    }
    return null
  }
}

export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  await requireAuth()

  try {
    await fetcher(`${process.env.BACKEND_BASE_URL}/projects/${projectId}`, {
      method: "DELETE"
    })

    return { success: true }
  } catch (error) {
    return handleServerError(error);
  }
}