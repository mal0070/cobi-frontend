import type { AnalyzeResponse } from "@/types/api";

export const LATEST_RESULT_KEY = "cobi_latest";

export interface LatestResult {
  response: AnalyzeResponse;
  code: string;
}

export function saveLatestResult(data: LatestResult): void {
  try {
    sessionStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(data));
  } catch {}
}

export function loadLatestResult(): LatestResult | null {
  try {
    const raw = sessionStorage.getItem(LATEST_RESULT_KEY);
    return raw ? (JSON.parse(raw) as LatestResult) : null;
  } catch {
    return null;
  }
}
