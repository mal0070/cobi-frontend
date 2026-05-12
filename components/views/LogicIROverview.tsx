import type { LogicIR } from "@/types/api";
import { AlertTriangle, Boxes, GitBranch, Sigma, Variable } from "lucide-react";

interface Props {
  data: LogicIR;
}

/**
 * Logic IR Overview
 *
 * 백엔드가 LLM으로 분석한 구조화된 로직 정보를 표시합니다.
 * - inputs: 입력 변수
 * - branches: 조건 분기
 * - derived_values: 파생값
 * - edge_cases: 엣지 케이스
 * - states: 상태
 * - uncertainties: 불확실성
 */
export function LogicIROverview({ data }: Props) {
  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="pb-4 border-b border-zinc-800">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
          SUMMARY
        </p>
        <p className="text-sm text-zinc-200 leading-relaxed">{data.summary}</p>
      </div>

      {/* Inputs */}
      {data.inputs.length > 0 && (
        <Section icon={Variable} title="입력 변수" count={data.inputs.length}>
          <div className="flex flex-wrap gap-2">
            {data.inputs.map((input, i) => (
              <code
                key={i}
                className="px-2.5 py-1 rounded-md bg-zinc-950/60 border border-zinc-800 text-xs font-mono text-zinc-300"
              >
                {input}
              </code>
            ))}
          </div>
        </Section>
      )}

      {/* Branches */}
      {data.branches.length > 0 && (
        <Section icon={GitBranch} title="조건 분기" count={data.branches.length}>
          <div className="space-y-2">
            {data.branches.map((branch, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 overflow-hidden"
              >
                <div className="px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/80 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-600">
                    BRANCH {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="p-3 space-y-2">
                  <Row label="condition">
                    <code className="text-xs font-mono text-amber-300/90 break-all">
                      {branch.condition}
                    </code>
                  </Row>
                  <Row label="result">
                    <code className="text-xs font-mono text-emerald-300/90 break-all">
                      {branch.result}
                    </code>
                  </Row>
                  <Row label="meaning">
                    <span className="text-sm text-zinc-300">{branch.plain_meaning}</span>
                  </Row>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Derived Values */}
      {data.derived_values.length > 0 && (
        <Section icon={Sigma} title="파생값" count={data.derived_values.length}>
          <div className="space-y-2">
            {data.derived_values.map((dv, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <code className="text-sm font-mono text-zinc-100">{dv.name}</code>
                  <span className="text-zinc-600">=</span>
                  <code className="text-xs font-mono text-zinc-400">{dv.expression}</code>
                </div>
                <p className="text-xs text-zinc-500">{dv.meaning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* States */}
      {data.states.length > 0 && (
        <Section icon={Boxes} title="상태" count={data.states.length}>
          <div className="space-y-2">
            {data.states.map((state, i) => (
              <div
                key={i}
                className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-sm font-mono text-zinc-100">{state.name}</code>
                  <span className="text-zinc-600">initial:</span>
                  <code className="text-xs font-mono text-blue-300">
                    {String(state.initial)}
                  </code>
                </div>
                <p className="text-xs text-zinc-500">{state.meaning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Edge Cases */}
      {data.edge_cases.length > 0 && (
        <Section icon={AlertTriangle} title="엣지 케이스" count={data.edge_cases.length}>
          <ul className="space-y-1.5">
            {data.edge_cases.map((edge, i) => (
              <li
                key={i}
                className="flex gap-2 text-sm text-zinc-300 px-3 py-2 rounded-md bg-amber-950/20 border border-amber-900/30"
              >
                <span className="text-amber-500/70 shrink-0">⚠</span>
                <span>{edge}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Uncertainties */}
      {data.uncertainties.length > 0 && (
        <Section
          icon={AlertTriangle}
          title="분석 불확실성"
          count={data.uncertainties.length}
        >
          <ul className="space-y-1.5">
            {data.uncertainties.map((unc, i) => (
              <li key={i} className="text-sm text-zinc-400 px-3 py-2">
                · {unc}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

// ============================================================
// Helpers
// ============================================================

interface SectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  children: React.ReactNode;
}

function Section({ icon: Icon, title, count, children }: SectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-zinc-400" />
        <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
        <span className="text-[10px] font-mono text-zinc-600">{count}</span>
      </div>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-baseline">
      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-600 w-16 shrink-0">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}