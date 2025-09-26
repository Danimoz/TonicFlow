import { Card, CardContent, CardHeader } from "@repo/ui/components/card"
import { LoadingSpinner } from "@repo/ui/components/loading-spinner"

// Simple skeleton component
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
    />
  )
}

export default function ProjectLoading() {
  return (
    <div className="h-screen bg-background">
      {/* Header/Toolbar Skeleton */}
      <div className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Project title and breadcrumb */}
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-6 rounded" /> {/* Back button */}
            <div>
              <Skeleton className="h-6 w-48 mb-1" /> {/* Project title */}
              <Skeleton className="h-4 w-32" /> {/* Breadcrumb */}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20" /> {/* Save button */}
            <Skeleton className="h-9 w-24" /> {/* Share button */}
            <Skeleton className="h-9 w-9 rounded-full" /> {/* Settings */}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Skeleton */}
        <div className="w-80 border-r bg-card flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-32 mb-3" />
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-18" />
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 p-4 space-y-4">
            {/* Editor preferences */}
            <div>
              <Skeleton className="h-5 w-24 mb-2" />
              <Skeleton className="h-9 w-full mb-2" />
              <Skeleton className="h-9 w-full" />
            </div>

            {/* Project settings */}
            <div>
              <Skeleton className="h-5 w-32 mb-2" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>

            {/* Version history */}
            <div>
              <Skeleton className="h-5 w-28 mb-2" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Area Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Editor Tabs */}
          <div className="border-b bg-card px-4">
            <div className="flex space-x-1 py-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-22" />
            </div>
          </div>

          {/* Editor Content Area */}
          <div className="flex-1 p-6">
            <Card className="h-full">
              <CardContent className="h-full p-0">
                {/* Loading spinner in center */}
                <div className="flex flex-col items-center justify-center h-full">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Loading Editor</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Initializing your music project and loading the editor interface...
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}