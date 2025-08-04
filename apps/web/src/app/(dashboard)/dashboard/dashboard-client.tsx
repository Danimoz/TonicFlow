"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/select"
import { Music, Plus, Search, Grid, List, ChevronLeft, ChevronRight } from "lucide-react"
import { NewProjectModal } from "@/components/new-project-modal"
import { ProjectCard } from "@/components/project-card"
import { Project, ProjectsResponse } from "../types"
import { useDebounce } from "use-debounce"
import { useCallback, useEffect, useState } from "react"
import { getQuickActions } from "./page.constants"
import { useRouter, useSearchParams } from "next/navigation"

interface DashboardClientProps {
  projects: ProjectsResponse['projects'];
  pagination: ProjectsResponse['pagination'];
  initialSearchQuery?: string;
  initialSortBy?: 'updatedAt' | 'createdAt' | 'title';
}

export function DashboardClient({
  projects,
  pagination,
  initialSearchQuery,
  initialSortBy,
}: DashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">(initialSortBy || "updatedAt")
  // Debounced search values
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500)
  const [debouncedSortBy] = useDebounce(sortBy, 100)

  // Quick Actions Map
  const actionsMap = new Map<string, () => void>([
    ["newProject", () => setIsNewProjectModalOpen(true)],
    ["settings", () => { }], // Placeholder for settings action
    ["documentation", () => window.open("https://docs.tonicflow.com", "_blank")],
  ])

  const updateSearchParams = useCallback(
    (newParams: Record<string, string | number | undefined>) => {
      const currentParams = new URLSearchParams(searchParams.toString())
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") {
          currentParams.delete(key)
        } else {
          currentParams.set(key, String(value))
        }
      })
      router.push(`/dashboard?${currentParams.toString()}`)
    },
    [router, searchParams],
  )

  // Handle debounced search query and sort changes
  useEffect(() => {
    updateSearchParams({ search: debouncedSearchQuery, sortBy: debouncedSortBy, page: 1 })
  }, [debouncedSearchQuery, debouncedSortBy, updateSearchParams])

  // Handle pagination
  const handlePageChange = async (page: number) => {
    updateSearchParams({ page })
  }

  const handleProjectDeleted = () => {
    // Refresh current page
  }

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
          {getQuickActions(actionsMap, pagination.total).map((action) => (
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

              {(pagination.total > 0 || searchQuery) && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search projects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>

                  <Select
                    value={sortBy}
                    onValueChange={(value) => setSortBy(value as "updatedAt" | "createdAt" | "title")}
                  >
                    <SelectTrigger className="px-3 py-2 border rounded-md bg-background text-sm">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updatedAt">Last Updated</SelectItem>
                      <SelectItem value="createdAt">Date Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            {projects.length === 0 ? (
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
            ) : (
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
                      disabled={!pagination.hasPrev}
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
                      disabled={!pagination.hasNext}
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
      />
    </div>
  )
}