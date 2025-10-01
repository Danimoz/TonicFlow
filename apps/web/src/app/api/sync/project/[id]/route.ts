import { fetcher } from "@/lib/fetcher";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const body = await request.json();

  if (!id) {
    return Response.json({ message: 'Project ID is required', error: true }, { status: 400 });
  }

  try {
    const res = await fetcher(process.env.BACKEND_BASE_URL + `/projects/${id}/update-current-version`, {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!res) return Response.json({ message: 'Failed to sync project', error: true }, { status: 500 });
    return Response.json({ message: "Project synced successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error syncing project:", error);
    return Response.json({ message: "Error syncing project", error: true }, { status: 500 });
  }
}
