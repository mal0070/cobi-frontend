/**
 * 백엔드 API 타입 정의 (CoBi Backend)
 * Source: https://github.com/.../CoBi-backend
 * Endpoint: POST /api/analyze
 *
 * 백엔드 Pydantic 스키마와 1:1로 매칭됩니다.
 * 백엔드가 스키마를 변경하면 이 파일도 함께 업데이트해야 합니다.
 */

// ============================================================
// 역할 (직군)
// ============================================================

export type RoleId = "pm" | "designer" | "qa" | "cs";

export const ROLE_IDS: RoleId[] = ["pm", "designer", "qa", "cs"];

// ============================================================
// 언어
// ============================================================

/** 사용자가 선택할 수 있는 언어. "auto"이면 백엔드가 감지 */
export type LanguageId =
  | "auto"
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "go"
  | "rust"
  | "csharp"
  | "ruby"
  | "kotlin"
  | "php"
  | "c++"
  | "unknown";

// ============================================================
// 요청
// ============================================================

export interface AnalyzeRequest {
  code: string;
  /** "auto"이면 백엔드가 감지. 기본값 "auto" */
  language?: LanguageId | string;
  /** 미지정 시 백엔드가 ["pm", "designer", "qa", "cs"] 모두 생성 */
  roles?: RoleId[];
  /** 기본값 "detailed" */
  output_style?: "detailed" | "brief";
}

// ============================================================
// Logic IR
// ============================================================

export interface IRState {
  name: string;
  initial: boolean | number | string;
  meaning: string;
}

export interface IRDerivedValue {
  name: string;
  expression: string;
  meaning: string;
}

export interface IRBranch {
  condition: string;
  result: string;
  plain_meaning: string;
}

export interface LogicIR {
  language: string;
  summary: string;
  inputs: string[];
  states: IRState[];
  derived_values: IRDerivedValue[];
  branches: IRBranch[];
  edge_cases: string[];
  uncertainties: string[];
}

// ============================================================
// Visualization (Mermaid)
// ============================================================

export interface Diagram {
  title: string;
  type: string;
  /** Mermaid 원본 문자열 */
  mermaid: string;
}

export interface Visualizations {
  flowchart: Diagram;
  state_diagram: Diagram;
}

// ============================================================
// Role View (4가지 직군 모두 동일 구조)
// ============================================================

export interface RoleView {
  primary_visualization: string;
  title: string;
  summary: string;
  key_points: string[];
  questions_to_confirm: string[];
}

// ============================================================
// 응답
// ============================================================

export interface AnalyzeResponse {
  detected_language: string;
  logic_ir: LogicIR;
  visualizations: Visualizations;
  /** key = RoleId ("pm" | "designer" | "qa" | "cs") */
  role_views: Partial<Record<RoleId, RoleView>>;
  warnings: string[];
  /** 0.0 ~ 1.0 */
  confidence: number;
}

// ============================================================
// 프론트 전용 UI 상태
// ============================================================

export type AnalysisStatus = "idle" | "loading" | "success" | "error";