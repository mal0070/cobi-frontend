const BACKEND_URL = process.env.BACKEND_URL || "https://cobi-backend-k8ff.onrender.com";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ detail: "Invalid JSON body" }, { status: 400 });
  }

  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Backend unreachable";
    return Response.json({ detail: message }, { status: 502 });
  }

  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
