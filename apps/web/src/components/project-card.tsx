"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card"
import { Button } from "@repo/ui/components/button"
import { Music, MoreVertical, Edit, Trash2, Calendar, User, Clock } from "lucide-react"
import { deleteProject } from "@/app/(dashboard)/actions"
import { Project } from "@/app/(dashboard)/types"
import Link from "next/link"

interface ProjectCardProps {
  project: Project
  onDelete?: () => void
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      return
    }

    setIsDeleting(true)
    try {
      const result = await deleteProject(project.id)
      if (result.success) {
        onDelete?.()
      } else {
        alert(result.error || "Failed to delete project")
      }
    } catch (error) {
      alert("An error occurred while deleting the project")
    } finally {
      setIsDeleting(false)
      setShowMenu(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <Card className="hover:shadow-card transition-all duration-200 group flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Music className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{project.title}</CardTitle>
              {project.subTitle && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {project.subTitle}
                </p>
              )}
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={() => setShowMenu(!showMenu)}
              disabled={isDeleting}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-32 bg-background border rounded-md shadow-lg z-10">
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                  onClick={() => {
                    // TODO: Implement edit functionality
                    setShowMenu(false)
                  }}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted text-destructive flex items-center gap-2"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-3 w-3" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col flex-1">
        <div className="space-y-2 text-sm text-muted-foreground flex-1">
          {project.composer && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>Composer: {project.composer}</span>
            </div>
          )}

          {project.arranger && (
            <div className="flex items-center gap-2">
              <User className="h-3 w-3" />
              <span>Arranger: {project.arranger}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {project.keySignature && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {project.keySignature}
                </span>
              )}
              {project.timeSignature && (
                <span className="text-xs bg-muted px-2 py-1 rounded">
                  {project.timeSignature}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">{formatDate(project.updatedAt)}</span>
            </div>
          </div>

          {(project.tempo || project.yearOfComposition) && (
            <div className="flex items-center gap-4 pt-1">
              {project.tempo && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{project.tempo}</span>
                </div>
              )}
              {project.yearOfComposition && (
                <span className="text-xs">Year: {project.yearOfComposition}</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t">
          <Button
            className="w-full"
            size="sm"
            asChild
          >
            <Link href={`/project/${project.id}`}>Open Project</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}