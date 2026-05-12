import { MOCK_RESPONSE } from "@/lib/mockData";

const BACKEND_URL = process.env.BACKEND_URL || "https://cobi-backend-k8ff.onrender.com";
const IS_DEV = process.env.NODE_ENV === "development";

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
    if (IS_DEV) {
      console.warn("[dev] 백엔드 연결 실패, mock 데이터를 반환합니다.", e);
      await new Promise((r) => setTimeout(r, 1000));
      return Response.json(MOCK_RESPONSE, { status: 200 });
    }
    const message = e instanceof Error ? e.message : "Backend unreachable";
    return Response.json({ detail: message }, { status: 502 });
  }

  const data = await res.json().catch(() => ({}));
  return Response.json(data, { status: res.status });
}
