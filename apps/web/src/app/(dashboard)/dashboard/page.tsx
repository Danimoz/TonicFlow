import { DashboardClient } from "./dashboard-client"
import { getProjects } from "../actions"

export default async function DashboardPage() {
  // Get initial projects with default pagination
  const initialData = await getProjects({ page: 1, limit: 20 })

  return <DashboardClient initialData={initialData} />
}