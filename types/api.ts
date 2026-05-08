/**
 * 백엔드 응답 타입 정의
 * - 백엔드가 LLM을 통해 코드를 분석하고 반환하는 응답 형식
 * - Mermaid 코드와 직군별로 가공된 View 데이터를 포함
 */

// ============================================================
// 요청 타입
// ============================================================

export type RoleId = "pm" | "designer" | "qa";

export interface AnalyzeRequest {
  code: string;
  language?: "javascript" | "typescript" | "python" | "java";
  roles: RoleId[];
}

// ============================================================
// 공통 메타 정보
// ============================================================

export interface AnalysisMeta {
  functionName: string;
  branches: number;
  complexity: "Low" | "Medium" | "High";
  summary: string;
  language: string;
}

// ============================================================
// 다이어그램 (Mermaid 원본 코드)
// ============================================================

export interface MermaidDiagram {
  /** Mermaid 원본 코드 (백엔드에서 생성) */
  code: string;
  /** 다이어그램 타입 */
  type: "flowchart" | "stateDiagram";
  /** 캡션/설명 */
  caption?: string;
}

// ============================================================
// PM View - 비즈니스 로직 시나리오
// ============================================================

export interface PMScenario {
  condition: string;
  result: string;
  impact: "High" | "Medium" | "Low";
  userMessage: string;
}

export interface PMView {
  title: string;
  scenarios: PMScenario[];
  metrics: {
    totalScenarios: number;
    blockingCases: number;
    successRate: string;
  };
}

// ============================================================
// Designer View - 사용자 화면 흐름
// ============================================================

export interface DesignerScreen {
  state: string;
  condition: string;
  ui: string;
  message: string;
}

export interface DesignerView {
  title: string;
  screens: DesignerScreen[];
}

// ============================================================
// QA View - 테스트 시나리오
// ============================================================

export interface QATestCase {
  id: string;
  title: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  steps: string[];
  expected: string;
  type: "Positive" | "Negative" | "Edge" | "Boundary";
}

export interface QAView {
  title: string;
  testCases: QATestCase[];
  coverage: {
    branches: string;
    cases: number;
    categories: string[];
  };
}

// ============================================================
// 최종 응답
// ============================================================

export interface AnalyzeResponse {
  meta: AnalysisMeta;
  flowchart: MermaidDiagram;
  stateDiagram: MermaidDiagram;
  pmView?: PMView;
  designerView?: DesignerView;
  qaView?: QAView;
}

export type AnalysisStatus = "idle" | "loading" | "success" | "error";