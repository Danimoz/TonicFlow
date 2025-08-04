import { DashboardClient } from "./dashboard-client"
import { getProjects } from "../actions"

interface DashboardPageProps {
  searchParams: {
    page?: string
    limit?: string
    search?: string
    sortBy?: "title" | "createdAt" | "updatedAt"
    sortOrder?: "asc" | "desc"
  }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { page, limit, search, sortBy, sortOrder } = await searchParams
  const projectsData = await getProjects({ page: Number(page), limit: Number(limit), search, sortBy, sortOrder })

  return (
    <DashboardClient
      projects={projectsData.projects}
      pagination={projectsData.pagination}
      initialSearchQuery={search}
      initialSortBy={sortBy}
    />
  )
}