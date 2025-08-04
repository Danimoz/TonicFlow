"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog"
import { FormField } from "@repo/ui/components/form-field"
import { Button } from "@repo/ui/components/button"
import { LoadingSpinner } from "@repo/ui/components/loading-spinner"
import { createProject } from "@/app/(dashboard)/actions"
import { Project } from "@/app/(dashboard)/types"
import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface FormErrors {
  title?: string
  subTitle?: string
  composer?: string
  arranger?: string
  keySignature?: string
  timeSignature?: string
  yearOfComposition?: string
  tempo?: string
}

export function NewProjectModal({ isOpen, onClose, onSuccess }: NewProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [generalError, setGeneralError] = useState("")
  const { push } = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setGeneralError("")

    const formData = new FormData(e.currentTarget)

    try {
      const result = await createProject(formData)

      if (result.success && result.project) {
        // Call onSuccess callback to refresh the projects list
        if (onSuccess) {
          onSuccess()
        }

        // Close the modal
        handleClose()

        // Navigate to the newly created project
        push(`/dashboard/projects/${result.project.id}`)
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        }
        if (result.error) {
          setGeneralError(result.error)
        }
      }
    } catch (error) {
      console.error("Create project error:", error)
      setGeneralError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setErrors({})
      setGeneralError("")
      onClose()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Start a new music notation project
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {generalError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <FormField
              name="title"
              label="Title *"
              placeholder="Enter project title"
              error={errors.title}
              required
              disabled={isLoading}
            />

            <FormField
              name="subTitle"
              label="Subtitle"
              placeholder="Enter subtitle (optional)"
              error={errors.subTitle}
              disabled={isLoading}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="composer"
                label="Composer"
                placeholder="Composer name"
                error={errors.composer}
                disabled={isLoading}
              />

              <FormField
                name="arranger"
                label="Arranger"
                placeholder="Arranger name"
                error={errors.arranger}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="keySignature"
                label="Key Signature"
                placeholder="e.g., C major"
                error={errors.keySignature}
                disabled={isLoading}
              />

              <FormField
                name="timeSignature"
                label="Time Signature"
                placeholder="e.g., 4/4"
                error={errors.timeSignature}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="yearOfComposition"
                label="Year"
                placeholder="Year of composition"
                error={errors.yearOfComposition}
                disabled={isLoading}
              />

              <FormField
                name="tempo"
                label="Tempo"
                placeholder="e.g., Allegro, 120 BPM"
                error={errors.tempo}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}