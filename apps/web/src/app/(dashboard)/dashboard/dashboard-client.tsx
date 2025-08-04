"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Music, Plus, Search, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import { NewProjectModal } from "@/components/new-project-modal"
import { ProjectCard } from "@/components/project-card"
import { Project, ProjectsResponse } from "../types"
import { getProjects } from "../actions"
import { useDebounce } from "use-debounce"
import { useCallback, useEffect, useState } from "react"
import { getQuickActions } from "./page.constants"

interface DashboardClientProps {
  initialData: ProjectsResponse
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<ProjectsResponse>(initialData)
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">("updatedAt")
  const [loading, setLoading] = useState(false)

  // Debounced search values
  const [debouncedSearchQuery] = useDebounce(searchQuery, 300)
  const [debouncedSortBy] = useDebounce(sortBy, 100)

  const actionsMap = new Map<string, () => void>([
    ["newProject", () => setIsNewProjectModalOpen(true)],
    ["settings", () => {}], // Placeholder for settings action
    ["documentation", () => window.open("https://docs.tonicflow.com", "_blank")],
  ])
  // Search function
  const performSearch = useCallback(async (query: string, sort: string) => {
    setLoading(true)
    try {
      const result = await getProjects({
        page: 1, // Reset to first page on search
        limit: 20,
        search: query,
        sortBy: sort as 'title' | 'createdAt' | 'updatedAt',
        sortOrder: 'desc'
      })
      setData(result)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Handle debounced search query and sort changes
  useEffect(() => {
    performSearch(debouncedSearchQuery, debouncedSortBy)
  }, [debouncedSearchQuery, debouncedSortBy, performSearch])

  // Handle pagination
  const handlePageChange = async (page: number) => {
    setLoading(true)
    try {
      const result = await getProjects({
        page,
        limit: 20,
        search: searchQuery,
        sortBy,
        sortOrder: 'desc'
      })
      setData(result)
    } catch (error) {
      console.error('Page change failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectCreated = () => {
    // Refresh current page
    handlePageChange(data.pagination.page)
  }

  const handleProjectDeleted = () => {
    // Refresh current page
    handlePageChange(data.pagination.page)
  }

  const { projects, pagination } = data

  return (
    <div className="h-screen bg-background mt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Tonic Flow</h1>
          <p className="text-muted-foreground">Start creating beautiful music notation projects</p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getQuickActions(actionsMap, data.pagination.total).map((action) => (
            <Card
              key={action.label}
              className={`hover:shadow-card transition-shadow cursor-pointer ${action.cardClass}`}
              onClick={action.clickAction}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 ${action.theme}`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold mb-2">{action.label}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>   
          ))}
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Your Projects ({pagination.total})
              </CardTitle>

              {pagination.total > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                      disabled={loading}
                    />
                  </div>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "updatedAt" | "createdAt" | "title")}
                    className="px-3 py-2 border rounded-md bg-background text-sm"
                    disabled={loading}
                  >
                    <option value="updatedAt">Last Updated</option>
                    <option value="createdAt">Date Created</option>
                    <option value="title">Title</option>
                  </select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                      disabled={loading}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                      disabled={loading}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading...</p>
              </div>
            )}

            {!loading && projects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Music className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {pagination.total === 0 ? "No projects yet" : "No projects found"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {pagination.total === 0
                    ? "Create your first music notation project to get started"
                    : "Try adjusting your search criteria"
                  }
                </p>
                {pagination.total === 0 && (
                  <Button onClick={() => setIsNewProjectModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Project
                  </Button>
                )}
              </div>
            ) : !loading && (
              <>
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }>
                  {projects.map((project: Project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleProjectDeleted}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext || loading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={handleProjectCreated}
      />
    </div>
  )
}