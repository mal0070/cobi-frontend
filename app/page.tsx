'use client'
 import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { detectLanguage } from "@/lib/detectLanguage";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Code2,
  GitBranch,
  Layers,
  Loader2,
  Palette,
  Play,
  RefreshCw,
  Sparkles,
  Wand2
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ============================================================
// Mock 데이터
// ============================================================

const SAMPLE_CODE = `function processOrder(order) {
  if (!order.userId) {
    return { status: 'error', message: 'Login required' };
  }

  if (order.amount <= 0) {
    return { status: 'error', message: 'Invalid amount' };
  }

  if (order.amount > 1000000) {
    return { status: 'pending', message: 'Approval required' };
  }

  return { status: 'success', message: 'Order processed' };
}`;

const ROLES = [
  {
    id: "pm",
    label: "PM",
    subtitle: "제품 매니저",
    desc: "비즈니스 시나리오",
    icon: BarChart3,
    accent: "rgb(96 165 250)",
  },
  {
    id: "designer",
    label: "Designer",
    subtitle: "디자이너",
    desc: "사용자 화면 흐름",
    icon: Palette,
    accent: "rgb(244 114 182)",
  },
  {
    id: "qa",
    label: "QA",
    subtitle: "품질 검증",
    desc: "테스트 케이스",
    icon: ClipboardCheck,
    accent: "rgb(52 211 153)",
  },
];

// ============================================================
// 지원 언어 목록
// ============================================================

const LANGUAGES = [
  { id: "javascript", label: "JavaScript", ext: "js", filename: "code" },
  { id: "typescript", label: "TypeScript", ext: "ts", filename: "code" },
  { id: "python", label: "Python", ext: "py", filename: "main" },
  { id: "java", label: "Java", ext: "java", filename: "Main" },
  { id: "go", label: "Go", ext: "go", filename: "main" },
  { id: "rust", label: "Rust", ext: "rs", filename: "main" },
  { id: "csharp", label: "C#", ext: "cs", filename: "Program" },
  { id: "ruby", label: "Ruby", ext: "rb", filename: "main" },
  { id: "kotlin", label: "Kotlin", ext: "kt", filename: "Main" },
  { id: "php", label: "PHP", ext: "php", filename: "index" },
] as const;

type LanguageId = (typeof LANGUAGES)[number]["id"];

// ============================================================
// 언어 자동 감지 (휴리스틱)
// ============================================================
// 실제 프로젝트에서는 lib/detectLanguage.ts로 분리해 사용하세요.


const MOCK_RESULT = {
  meta: {
    functionName: "processOrder",
    branches: 4,
    complexity: "Low",
    summary: "주문 처리 로직 — 4개 분기, 3가지 종료 상태",
  },
  pmView: {
    scenarios: [
      { condition: "로그인하지 않은 사용자", result: "주문 차단", impact: "High" as const, userMessage: "로그인이 필요합니다" },
      { condition: "금액이 0원 이하", result: "주문 차단", impact: "Medium" as const, userMessage: "올바른 금액을 입력해주세요" },
      { condition: "100만원 초과 주문", result: "관리자 승인 대기", impact: "High" as const, userMessage: "관리자 승인을 기다리고 있어요" },
      { condition: "정상 주문", result: "즉시 처리", impact: "Low" as const, userMessage: "주문이 완료되었습니다" },
    ],
    metrics: { totalScenarios: 4, blockingCases: 2, successRate: "50%" },
  },
  designerView: {
    screens: [
      { state: "검증 중", condition: "주문 제출 직후", ui: "로딩 인디케이터", message: "주문을 처리하고 있어요" },
      { state: "에러 - 로그인", condition: "userId 없음", ui: "로그인 모달", message: "로그인 후 다시 시도해주세요" },
      { state: "에러 - 금액", condition: "amount ≤ 0", ui: "인풋 에러 메시지", message: "올바른 금액을 입력해주세요" },
      { state: "승인 대기", condition: "amount > 1,000,000", ui: "진행률 화면", message: "관리자 승인을 기다리고 있어요" },
      { state: "성공", condition: "검증 완료", ui: "주문 확인 페이지", message: "주문이 완료되었습니다" },
    ],
  },
  qaView: {
    testCases: [
      { id: "TC-001", title: "비로그인 주문 차단", priority: "Critical" as const, steps: ["로그아웃 상태로 접속", "주문 제출"], expected: "error / Login required", type: "Negative" },
      { id: "TC-002", title: "0원 주문 차단", priority: "High" as const, steps: ["금액 0으로 주문"], expected: "error / Invalid amount", type: "Edge" },
      { id: "TC-003", title: "음수 금액 차단", priority: "High" as const, steps: ["금액 -1000으로 주문"], expected: "error / Invalid amount", type: "Edge" },
      { id: "TC-004", title: "거액 승인 절차", priority: "Critical" as const, steps: ["금액 1,000,001원으로 주문"], expected: "pending / Approval required", type: "Boundary" },
      { id: "TC-005", title: "정상 주문 처리", priority: "High" as const, steps: ["금액 50,000원으로 주문"], expected: "success / Order processed", type: "Positive" },
    ],
    coverage: { branches: "100%", cases: 5, categories: ["Positive", "Negative", "Edge", "Boundary"] },
  },
};

// ============================================================
// Flowchart - 모듈 스코프 정의 (FIX: 컴포넌트를 render 밖으로)
// ============================================================

const FLOWCHART_NODES = {
  start: { x: 280, y: 30, label: "Start", type: "start" as const },
  checkUser: { x: 280, y: 110, label: "userId 있음?", type: "decision" as const },
  errorUser: { x: 80, y: 200, label: "로그인 필요", type: "error" as const },
  checkAmount: { x: 280, y: 220, label: "amount > 0?", type: "decision" as const },
  errorAmount: { x: 80, y: 330, label: "잘못된 금액", type: "error" as const },
  checkLarge: { x: 280, y: 340, label: "amount > 1M?", type: "decision" as const },
  pending: { x: 100, y: 460, label: "승인 대기", type: "pending" as const },
  success: { x: 380, y: 460, label: "주문 완료", type: "success" as const },
};

type NodeId = keyof typeof FLOWCHART_NODES;
type FlowNode = (typeof FLOWCHART_NODES)[NodeId];

const NODE_COLORS = {
  start: { fill: "#27272a", stroke: "#71717a", text: "#fafafa" },
  decision: { fill: "#1c1917", stroke: "#a1a1aa", text: "#fafafa" },
  error: { fill: "#450a0a", stroke: "#f87171", text: "#fca5a5" },
  success: { fill: "#022c22", stroke: "#34d399", text: "#6ee7b7" },
  pending: { fill: "#451a03", stroke: "#fbbf24", text: "#fcd34d" },
};

// ✅ 외부 컴포넌트로 추출
function FlowchartNode({ node }: { node: FlowNode }) {
  const c = NODE_COLORS[node.type];
  if (node.type === "decision") {
    return (
      <g>
        <polygon
          points={`${node.x},${node.y - 28} ${node.x + 90},${node.y} ${node.x},${node.y + 28} ${node.x - 90},${node.y}`}
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth="1.5"
        />
        <text x={node.x} y={node.y + 4} textAnchor="middle" fill={c.text} fontSize="12" fontFamily="ui-monospace, monospace">
          {node.label}
        </text>
      </g>
    );
  }
  return (
    <g>
      <rect
        x={node.x - 70}
        y={node.y - 18}
        width="140"
        height="36"
        rx={node.type === "start" ? 18 : 6}
        fill={c.fill}
        stroke={c.stroke}
        strokeWidth="1.5"
      />
      <text x={node.x} y={node.y + 4} textAnchor="middle" fill={c.text} fontSize="12" fontFamily="ui-monospace, monospace">
        {node.label}
      </text>
    </g>
  );
}

// ✅ 외부 컴포넌트로 추출
function FlowchartEdge({ from, to, label }: { from: NodeId; to: NodeId; label?: string }) {
  const f = FLOWCHART_NODES[from];
  const t = FLOWCHART_NODES[to];
  const midX = (f.x + t.x) / 2;
  const midY = (f.y + t.y) / 2;
  return (
    <g>
      <line x1={f.x} y1={f.y + 28} x2={t.x} y2={t.y - 18} stroke="#52525b" strokeWidth="1.5" markerEnd="url(#arrow)" />
      {label && (
        <g>
          <rect x={midX - 14} y={midY - 8} width="28" height="16" rx="3" fill="#0a0a0a" stroke="#3f3f46" />
          <text x={midX} y={midY + 3} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="ui-monospace, monospace">
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

function FlowchartDiagram() {
  return (
    <svg viewBox="0 0 560 510" className="w-full h-full">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="#71717a" />
        </marker>
      </defs>
      <FlowchartEdge from="start" to="checkUser" />
      <FlowchartEdge from="checkUser" to="errorUser" label="No" />
      <FlowchartEdge from="checkUser" to="checkAmount" label="Yes" />
      <FlowchartEdge from="checkAmount" to="errorAmount" label="No" />
      <FlowchartEdge from="checkAmount" to="checkLarge" label="Yes" />
      <FlowchartEdge from="checkLarge" to="pending" label="Yes" />
      <FlowchartEdge from="checkLarge" to="success" label="No" />
      {Object.entries(FLOWCHART_NODES).map(([id, n]) => (
        <FlowchartNode key={id} node={n} />
      ))}
    </svg>
  );
}

// ============================================================
// State Diagram - 동일하게 모듈 스코프로
// ============================================================

const STATES = [
  { id: "idle", x: 90, y: 200, label: "Idle" },
  { id: "validating", x: 270, y: 200, label: "Validating" },
  { id: "pending", x: 470, y: 80, label: "Pending" },
  { id: "success", x: 470, y: 200, label: "Success" },
  { id: "error", x: 470, y: 320, label: "Error" },
];

const TRANSITIONS = [
  { from: "idle", to: "validating", label: "submit" },
  { from: "validating", to: "pending", label: "amount > 1M" },
  { from: "validating", to: "success", label: "valid" },
  { from: "validating", to: "error", label: "invalid" },
];

type State = (typeof STATES)[number];

function StateNode({ state }: { state: State }) {
  return (
    <g>
      <rect x={state.x - 50} y={state.y - 22} width="100" height="44" rx="22" fill="#1c1917" stroke="#a1a1aa" strokeWidth="1.5" />
      <text x={state.x} y={state.y + 5} textAnchor="middle" fill="#fafafa" fontSize="13" fontFamily="ui-monospace, monospace">
        {state.label}
      </text>
    </g>
  );
}

function StateTransition({ from, to, label }: { from: string; to: string; label: string }) {
  const f = STATES.find((s) => s.id === from)!;
  const t = STATES.find((s) => s.id === to)!;
  const dx = t.x - f.x;
  const dy = t.y - f.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len;
  const uy = dy / len;
  const startX = f.x + ux * 50;
  const startY = f.y + uy * 22;
  const endX = t.x - ux * 50;
  const endY = t.y - uy * 22;
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  return (
    <g>
      <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#71717a" strokeWidth="1.5" markerEnd="url(#state-arrow)" />
      <rect x={midX - 38} y={midY - 9} width="76" height="18" rx="3" fill="#0a0a0a" stroke="#3f3f46" />
      <text x={midX} y={midY + 3} textAnchor="middle" fill="#a1a1aa" fontSize="10" fontFamily="ui-monospace, monospace">
        {label}
      </text>
    </g>
  );
}

function StateDiagram() {
  return (
    <svg viewBox="0 0 580 420" className="w-full h-full">
      <defs>
        <marker id="state-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <polygon points="0 0, 8 4, 0 8" fill="#71717a" />
        </marker>
      </defs>
      <circle cx="30" cy="200" r="6" fill="#fafafa" />
      <line x1="36" y1="200" x2="50" y2="200" stroke="#71717a" strokeWidth="1.5" markerEnd="url(#state-arrow)" />
      {TRANSITIONS.map((tr, i) => (
        <StateTransition key={i} from={tr.from} to={tr.to} label={tr.label} />
      ))}
      {STATES.map((s) => (
        <StateNode key={s.id} state={s} />
      ))}
    </svg>
  );
}

// ============================================================
// 메인 앱
// ============================================================

type Status = "idle" | "loading" | "result";
type Tab = "flowchart" | "state" | "pm" | "designer" | "qa";

export default function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [autoDetect, setAutoDetect] = useState(true);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["pm", "designer", "qa"]);
  const [status, setStatus] = useState<Status>("idle");
  const [activeTab, setActiveTab] = useState<Tab>("flowchart");
  const [codeCollapsed, setCodeCollapsed] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  // 언어 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!langOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  // 자동 언어 감지 (300ms 디바운싱)
  // 사용자가 수동으로 언어를 선택하면 autoDetect=false가 되어 감지 멈춤
  useEffect(() => {
    if (!autoDetect) return;
    const handler = setTimeout(() => {
      const detected = detectLanguage(code);
      if (detected && detected !== language) {
        setLanguage(detected);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [code, autoDetect, language]);

  const handleAnalyze = () => {
    if (!code.trim() || selectedRoles.length === 0) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("result");
      setActiveTab("flowchart");
      setCodeCollapsed(true);
    }, 1800);
  };

  const handleReset = () => {
    setStatus("idle");
    setCodeCollapsed(false);
  };

  const toggleRole = (id: string) => {
    setSelectedRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif' }}>
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

     <Header/>

      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {status === "idle" && (
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 font-mono mb-5">
              <Sparkles className="w-3 h-3" />
              <span>AI-POWERED COLLABORATION</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
              코드를 붙여넣고,
              <br />
              <span className="text-zinc-400">팀원의 언어로 번역하세요.</span>
            </h2>
            <p className="text-zinc-500 max-w-xl text-sm leading-relaxed">
              조건 분기와 로직을 PM, 디자이너, QA가 빠르게 이해할 수 있는
              <br className="hidden md:block" />
              플로우차트와 직군별 시나리오로 자동 변환합니다.
            </p>
          </div>
        )}

        <section className="mb-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="w-full flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">
                  {currentLang.filename}.{currentLang.ext}
                </span>

                {/* 언어 선택 드롭다운 */}
                <div ref={langDropdownRef} className="relative ml-1">
                  <button
                    onClick={() => setLangOpen((v) => !v)}
                    disabled={status !== "idle"}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                    aria-haspopup="listbox"
                    aria-expanded={langOpen}
                  >
                    {currentLang.label}
                    {autoDetect && (
                      <span className="flex items-center gap-0.5 px-1 py-[1px] rounded bg-emerald-950/60 border border-emerald-900/60 text-emerald-400 text-[9px]">
                        <Wand2 className="w-2.5 h-2.5" />
                        AUTO
                      </span>
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
                  </button>
                  {langOpen && (
                    <div
                      role="listbox"
                      className="absolute top-full left-0 mt-1.5 w-52 rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 z-20 overflow-hidden"
                    >
                      {/* Auto-detect 옵션 */}
                      <button
                        role="option"
                        aria-selected={autoDetect}
                        onClick={() => {
                          setAutoDetect(true);
                          // 즉시 한 번 감지
                          const detected = detectLanguage(code);
                          if (detected) setLanguage(detected);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors border-b border-zinc-800 ${
                          autoDetect
                            ? "bg-emerald-950/30 text-emerald-300"
                            : "text-zinc-300 hover:bg-zinc-800/60"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Wand2 className="w-3.5 h-3.5" />
                          <span className="font-medium">Auto-detect</span>
                        </span>
                        {autoDetect && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                        Manual
                      </div>
                      <div className="max-h-64 overflow-y-auto pb-1">
                        {LANGUAGES.map((lang) => {
                          const selected = !autoDetect && lang.id === language;
                          return (
                            <button
                              key={lang.id}
                              role="option"
                              aria-selected={selected}
                              onClick={() => {
                                setLanguage(lang.id);
                                setAutoDetect(false);
                                setLangOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors ${
                                selected
                                  ? "bg-zinc-800/80 text-zinc-100"
                                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-zinc-600 w-7">.{lang.ext}</span>
                                {lang.label}
                              </span>
                              {selected && <Check className="w-3.5 h-3.5 text-zinc-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Collapse 토글 (결과 화면에서만 보임) */}
              {status === "result" && (
                <button
                  onClick={() => setCodeCollapsed((v) => !v)}
                  className="p-1 rounded hover:bg-zinc-800 transition-colors"
                  aria-label={codeCollapsed ? "코드 펼치기" : "코드 접기"}
                >
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-500 transition-transform ${codeCollapsed ? "" : "rotate-180"}`}
                  />
                </button>
              )}
            </div>
            {!codeCollapsed && (
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={status !== "idle"}
                spellCheck={false}
                placeholder={`${currentLang.label} 코드를 입력하세요...`}
                className="w-full px-5 py-4 bg-transparent text-sm text-zinc-200 font-mono leading-relaxed resize-none focus:outline-none disabled:opacity-60 placeholder:text-zinc-700"
                style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', minHeight: "240px" }}
              />
            )}
          </div>
        </section>

        {status === "idle" && (
          <section className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                  분석할 직군 선택
                </h3>
                <span className="text-xs text-zinc-600">{selectedRoles.length}/3 선택됨</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => toggleRole(role.id)}
                      className={`relative p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-600"
                          : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/60"
                      }`}
                      style={isSelected ? { borderColor: role.accent, boxShadow: `0 0 0 1px ${role.accent}40` } : undefined}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: isSelected ? role.accent + "20" : "rgb(39 39 42)",
                            color: isSelected ? role.accent : "rgb(161 161 170)",
                          }}
                        >
                          <Icon className="w-[18px] h-[18px]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-zinc-100">{role.label}</span>
                            <span className="text-xs text-zinc-500">{role.subtitle}</span>
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{role.desc}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 absolute top-3 right-3" style={{ color: role.accent }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!code.trim() || selectedRoles.length === 0}
              className="w-full py-4 rounded-xl bg-zinc-100 text-zinc-900 font-medium text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              분석하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </section>
        )}

        {status === "loading" && (
          <section className="py-16">
            <div className="flex flex-col items-center justify-center gap-5">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border border-zinc-800" />
                <Loader2 className="w-14 h-14 absolute inset-0 animate-spin text-zinc-300" strokeWidth={1.5} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-200 mb-1">코드를 분석하고 있어요</p>
                <p className="text-xs text-zinc-500 font-mono">
                  Parsing logic → Generating IR → Building views...
                </p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {status === "result" && (
          <section className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
                  <span className="text-zinc-500">fn </span>
                  <span className="text-zinc-200">{MOCK_RESULT.meta.functionName}</span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
                  <span className="text-zinc-500">lang </span>
                  <span className="text-zinc-200">{currentLang.label}</span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
                  <span className="text-zinc-500">branches </span>
                  <span className="text-zinc-200">{MOCK_RESULT.meta.branches}</span>
                </div>
                <div className="px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-xs font-mono text-emerald-400">
                  complexity: {MOCK_RESULT.meta.complexity}
                </div>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-xs text-zinc-400 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                새로 분석
              </button>
            </div>

            <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto">
              {[
                { id: "flowchart", label: "Flowchart", icon: GitBranch, color: "#fafafa" },
                { id: "state", label: "State Diagram", icon: Activity, color: "#fafafa" },
                ...(selectedRoles.includes("pm") ? [{ id: "pm", label: "PM View", icon: BarChart3, color: ROLES[0].accent }] : []),
                ...(selectedRoles.includes("designer") ? [{ id: "designer", label: "Designer View", icon: Palette, color: ROLES[1].accent }] : []),
                ...(selectedRoles.includes("qa") ? [{ id: "qa", label: "QA View", icon: ClipboardCheck, color: ROLES[2].accent }] : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      active ? "border-current text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                    style={active ? { color: tab.color, borderColor: tab.color } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 min-h-[500px]">
              {activeTab === "flowchart" && (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span>RENDERED FROM MERMAID</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-6 border border-zinc-800/60">
                    <FlowchartDiagram />
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 text-center">{MOCK_RESULT.meta.summary}</p>
                </div>
              )}

              {activeTab === "state" && (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-500">
                    <Layers className="w-3.5 h-3.5" />
                    <span>STATE TRANSITIONS</span>
                  </div>
                  <div className="bg-zinc-950/60 rounded-lg p-6 border border-zinc-800/60">
                    <StateDiagram />
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 text-center">5개 상태, 4개 전이</p>
                </div>
              )}

              {activeTab === "pm" && (
                <div>
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { label: "총 시나리오", value: MOCK_RESULT.pmView.metrics.totalScenarios },
                      { label: "차단 케이스", value: MOCK_RESULT.pmView.metrics.blockingCases },
                      { label: "성공률", value: MOCK_RESULT.pmView.metrics.successRate },
                    ].map((m, i) => (
                      <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                        <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">{m.label}</p>
                        <p className="text-2xl font-semibold text-blue-400">{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {MOCK_RESULT.pmView.scenarios.map((s, i) => (
                      <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 hover:border-zinc-700 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs text-zinc-500 font-mono">CASE {String(i + 1).padStart(2, "0")}</span>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  s.impact === "High"
                                    ? "bg-red-950/50 text-red-400"
                                    : s.impact === "Medium"
                                    ? "bg-amber-950/50 text-amber-400"
                                    : "bg-zinc-800 text-zinc-400"
                                }`}
                              >
                                {s.impact}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-200">{s.condition}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-zinc-600 mt-1 shrink-0" />
                          <div className="flex-1 text-right">
                            <p className="text-sm text-zinc-200 mb-1">{s.result}</p>
                            <p className="text-xs text-zinc-500 italic">&ldquo;{s.userMessage}&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "designer" && (
                <div>
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-500">
                    <Palette className="w-3.5 h-3.5" style={{ color: ROLES[1].accent }} />
                    <span>SCREEN STATES</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MOCK_RESULT.designerView.screens.map((s, i) => (
                      <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-950/40 overflow-hidden">
                        <div className="aspect-video bg-zinc-900 border-b border-zinc-800 flex items-center justify-center relative">
                          <div className="absolute top-2 left-2 flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                            <div className="w-2 h-2 rounded-full bg-zinc-700" />
                          </div>
                          <div className="text-center px-4">
                            <div
                              className="inline-block px-2.5 py-1 rounded text-[10px] font-mono mb-2 border"
                              style={{ color: ROLES[1].accent, borderColor: ROLES[1].accent + "60" }}
                            >
                              {s.ui}
                            </div>
                            <p className="text-xs text-zinc-300">{s.message}</p>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-zinc-600">{String(i + 1).padStart(2, "0")}</span>
                            <p className="text-sm font-medium text-zinc-200">{s.state}</p>
                          </div>
                          <p className="text-xs text-zinc-500 font-mono">when: {s.condition}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "qa" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
                      <ClipboardCheck className="w-3.5 h-3.5" style={{ color: ROLES[2].accent }} />
                      <span>TEST CASES</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-zinc-500">
                        coverage: <span style={{ color: ROLES[2].accent }}>{MOCK_RESULT.qaView.coverage.branches}</span>
                      </span>
                      <span className="text-zinc-500">
                        cases: <span className="text-zinc-200">{MOCK_RESULT.qaView.coverage.cases}</span>
                      </span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 grid grid-cols-12 gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      <div className="col-span-1">ID</div>
                      <div className="col-span-4">Title</div>
                      <div className="col-span-2">Type</div>
                      <div className="col-span-2">Priority</div>
                      <div className="col-span-3">Expected</div>
                    </div>
                    {MOCK_RESULT.qaView.testCases.map((tc) => (
                      <div
                        key={tc.id}
                        className="px-4 py-3 grid grid-cols-12 gap-3 text-sm border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40 transition-colors items-center"
                      >
                        <div className="col-span-1 font-mono text-xs text-zinc-500">{tc.id}</div>
                        <div className="col-span-4 text-zinc-200">{tc.title}</div>
                        <div className="col-span-2">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded border"
                            style={{ color: ROLES[2].accent, borderColor: ROLES[2].accent + "40" }}
                          >
                            {tc.type}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span
                            className={`text-xs font-mono ${
                              tc.priority === "Critical"
                                ? "text-red-400"
                                : tc.priority === "High"
                                ? "text-amber-400"
                                : "text-zinc-400"
                            }`}
                          >
                            {tc.priority}
                          </span>
                        </div>
                        <div className="col-span-3 text-xs font-mono text-zinc-400 truncate">{tc.expected}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
     <Footer/>
    </div>
  );
}