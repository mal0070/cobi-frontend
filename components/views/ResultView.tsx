import { ROLES } from "@/components/views/IdleView";
import {
    Activity,
    ArrowRight,
    BarChart3,
    ClipboardCheck,
    GitBranch,
    Layers,
    Palette,
    RefreshCw,
} from "lucide-react";

export type Tab = "flowchart" | "state" | "pm" | "designer" | "qa";

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

// ── Flowchart ──────────────────────────────────────────────────

const FLOWCHART_NODES = {
  start:       { x: 280, y: 30,  label: "Start",        type: "start"    as const },
  checkUser:   { x: 280, y: 110, label: "userId 있음?", type: "decision" as const },
  errorUser:   { x: 80,  y: 200, label: "로그인 필요",  type: "error"    as const },
  checkAmount: { x: 280, y: 220, label: "amount > 0?",  type: "decision" as const },
  errorAmount: { x: 80,  y: 330, label: "잘못된 금액",  type: "error"    as const },
  checkLarge:  { x: 280, y: 340, label: "amount > 1M?", type: "decision" as const },
  pending:     { x: 100, y: 460, label: "승인 대기",    type: "pending"  as const },
  success:     { x: 380, y: 460, label: "주문 완료",    type: "success"  as const },
};

type NodeId = keyof typeof FLOWCHART_NODES;
type FlowNode = (typeof FLOWCHART_NODES)[NodeId];

const NODE_COLORS = {
  start:    { fill: "#27272a", stroke: "#71717a", text: "#fafafa" },
  decision: { fill: "#1c1917", stroke: "#a1a1aa", text: "#fafafa" },
  error:    { fill: "#450a0a", stroke: "#f87171", text: "#fca5a5" },
  success:  { fill: "#022c22", stroke: "#34d399", text: "#6ee7b7" },
  pending:  { fill: "#451a03", stroke: "#fbbf24", text: "#fcd34d" },
};

function FlowchartNode({ node }: { node: FlowNode }) {
  const c = NODE_COLORS[node.type];
  if (node.type === "decision") {
    return (
      <g>
        <polygon
          points={`${node.x},${node.y - 28} ${node.x + 90},${node.y} ${node.x},${node.y + 28} ${node.x - 90},${node.y}`}
          fill={c.fill} stroke={c.stroke} strokeWidth="1.5"
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
        x={node.x - 70} y={node.y - 18} width="140" height="36"
        rx={node.type === "start" ? 18 : 6}
        fill={c.fill} stroke={c.stroke} strokeWidth="1.5"
      />
      <text x={node.x} y={node.y + 4} textAnchor="middle" fill={c.text} fontSize="12" fontFamily="ui-monospace, monospace">
        {node.label}
      </text>
    </g>
  );
}

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
      <FlowchartEdge from="start"       to="checkUser"   />
      <FlowchartEdge from="checkUser"   to="errorUser"   label="No"  />
      <FlowchartEdge from="checkUser"   to="checkAmount" label="Yes" />
      <FlowchartEdge from="checkAmount" to="errorAmount" label="No"  />
      <FlowchartEdge from="checkAmount" to="checkLarge"  label="Yes" />
      <FlowchartEdge from="checkLarge"  to="pending"     label="Yes" />
      <FlowchartEdge from="checkLarge"  to="success"     label="No"  />
      {Object.entries(FLOWCHART_NODES).map(([id, n]) => (
        <FlowchartNode key={id} node={n} />
      ))}
    </svg>
  );
}

// ── State Diagram ──────────────────────────────────────────────

const STATES = [
  { id: "idle",       x: 90,  y: 200, label: "Idle"       },
  { id: "validating", x: 270, y: 200, label: "Validating" },
  { id: "pending",    x: 470, y: 80,  label: "Pending"    },
  { id: "success",    x: 470, y: 200, label: "Success"    },
  { id: "error",      x: 470, y: 320, label: "Error"      },
];

const TRANSITIONS = [
  { from: "idle",       to: "validating", label: "submit"       },
  { from: "validating", to: "pending",    label: "amount > 1M"  },
  { from: "validating", to: "success",    label: "valid"        },
  { from: "validating", to: "error",      label: "invalid"      },
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

// ── ResultView ─────────────────────────────────────────────────

interface ResultViewProps {
  selectedRoles: string[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onReset: () => void;
  currentLangLabel: string;
}

export default function ResultView({ selectedRoles, activeTab, onTabChange, onReset, currentLangLabel }: ResultViewProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-500">fn </span>
            <span className="text-zinc-200">{MOCK_RESULT.meta.functionName}</span>
          </div>
          <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <span className="text-zinc-500">lang </span>
            <span className="text-zinc-200">{currentLangLabel}</span>
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
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-xs text-zinc-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          새로 분석
        </button>
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto">
        {[
          { id: "flowchart", label: "Flowchart",      icon: GitBranch,   color: "#fafafa"          },
          { id: "state",     label: "State Diagram",  icon: Activity,    color: "#fafafa"          },
          ...(selectedRoles.includes("pm")       ? [{ id: "pm",       label: "PM View",       icon: BarChart3,   color: ROLES[0].accent }] : []),
          ...(selectedRoles.includes("designer") ? [{ id: "designer", label: "Designer View", icon: Palette,     color: ROLES[1].accent }] : []),
          ...(selectedRoles.includes("qa")       ? [{ id: "qa",       label: "QA View",       icon: ClipboardCheck, color: ROLES[2].accent }] : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as Tab)}
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
                { label: "차단 케이스", value: MOCK_RESULT.pmView.metrics.blockingCases  },
                { label: "성공률",      value: MOCK_RESULT.pmView.metrics.successRate    },
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
  );
}
