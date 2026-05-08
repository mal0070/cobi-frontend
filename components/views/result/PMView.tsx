import type { PMView as PMViewType } from "@/types/api";
import { ArrowRight } from "lucide-react";

interface Props {
  data: PMViewType;
}

const IMPACT_STYLES = {
  High: "bg-red-950/50 text-red-400",
  Medium: "bg-amber-950/50 text-amber-400",
  Low: "bg-zinc-800 text-zinc-400",
} as const;

export function PMView({ data }: Props) {
  return (
    <div>
      {/* 메트릭 카드 */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <MetricCard label="총 시나리오" value={data.metrics.totalScenarios} />
        <MetricCard label="차단 케이스" value={data.metrics.blockingCases} />
        <MetricCard label="성공률" value={data.metrics.successRate} />
      </div>

      {/* 시나리오 목록 */}
      <div className="space-y-2">
        {data.scenarios.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-zinc-500 font-mono">
                    CASE {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${IMPACT_STYLES[s.impact]}`}
                  >
                    {s.impact}
                  </span>
                </div>
                <p className="text-sm text-zinc-200">{s.condition}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 mt-1 shrink-0" />
              <div className="flex-1 text-right">
                <p className="text-sm text-zinc-200 mb-1">{s.result}</p>
                <p className="text-xs text-zinc-500 italic">&quot;{s.userMessage}&quot;</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
      <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-semibold text-blue-400">{value}</p>
    </div>
  );
}