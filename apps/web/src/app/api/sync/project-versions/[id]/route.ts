import { fetcher } from "@/lib/fetcher";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  const body = await request.json();

  try {
    const res = await fetcher(process.env.BACKEND_BASE_URL + `/projects/${id}/versions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!res || !res.ok) {
      return Response.json({ message: 'Failed to sync project versions', error: true }, { status: 500 });
    }
    return Response.json({ message: 'Project versions synced successfully' });
  } catch (error) {
    return Response.json({ message: 'Failed to sync project versions', error: true }, { status: 500 });
  }
}
