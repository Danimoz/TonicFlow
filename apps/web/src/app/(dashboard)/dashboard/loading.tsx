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

export default function DashboardLoading() {
  return (
    <div className="h-screen bg-background mt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                <Skeleton className="w-12 h-12 rounded-lg mx-auto mb-4" />
                <Skeleton className="h-5 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects Section Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Loading spinner in center */}
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-muted-foreground">Loading your projects...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
