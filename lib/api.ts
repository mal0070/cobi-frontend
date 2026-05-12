/**
 * CoBi Backend API 클라이언트
 *
 * 브라우저 → /api/analyze (Next.js 프록시) → 백엔드
 * CORS 우회를 위해 Next.js Route Handler를 통해 요청합니다.
 *
 * 백엔드 주소는 서버 환경변수 BACKEND_URL 로 설정합니다.
 * .env 예시:
 *   BACKEND_URL=http://localhost:8000
 */

import type { AnalyzeRequest, AnalyzeResponse } from "@/types/api";

export class AnalyzeError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly detail?: unknown
  ) {
    super(message);
    this.name = "AnalyzeError";
  }
}

/**
 * 코드 분석 요청
 *
 * 백엔드는 OpenAI를 호출하므로 응답에 5-30초가 걸릴 수 있습니다.
 * Render 무료 플랜은 콜드 스타트 시 첫 요청이 더 오래 걸립니다.
 */
export async function analyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
  const body: AnalyzeRequest = {
    code: req.code,
    language: req.language ?? "auto",
    roles: req.roles, // 미지정 시 백엔드가 4개 전부 생성
    output_style: req.output_style ?? "detailed",
  };

  let res: Response;
  try {
    res = await fetch(`/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // 네트워크 에러 (CORS, DNS, 오프라인 등)
    throw new AnalyzeError(
      e instanceof Error ? `서버에 연결할 수 없습니다: ${e.message}` : "서버에 연결할 수 없습니다."
    );
  }

  if (!res.ok) {
    let detail: unknown = undefined;
    let message = `분석 실패 (${res.status})`;
    try {
      detail = await res.json();
      if (detail && typeof detail === "object" && "detail" in detail) {
        message = String((detail as { detail: unknown }).detail);
      }
    } catch {
      // ignore
    }
    throw new AnalyzeError(message, res.status, detail);
  }

  try {
    return (await res.json()) as AnalyzeResponse;
  } catch {
    throw new AnalyzeError("응답을 파싱할 수 없습니다.");
  }
}