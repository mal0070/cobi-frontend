import type { QAView as QAViewType } from "@/types/api";
import { ClipboardCheck } from "lucide-react";

interface Props {
  data: QAViewType;
}

const ACCENT = "rgb(52 211 153)"; // emerald-400

const PRIORITY_STYLES = {
  Critical: "text-red-400",
  High: "text-amber-400",
  Medium: "text-zinc-400",
  Low: "text-zinc-500",
} as const;

export function QAView({ data }: Props) {
  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
          <ClipboardCheck className="w-3.5 h-3.5" style={{ color: ACCENT }} />
          <span>TEST CASES</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-500">
            coverage: <span style={{ color: ACCENT }}>{data.coverage.branches}</span>
          </span>
          <span className="text-zinc-500">
            cases: <span className="text-zinc-200">{data.coverage.cases}</span>
          </span>
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 grid grid-cols-12 gap-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          <div className="col-span-1">ID</div>
          <div className="col-span-4">Title</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-3">Expected</div>
        </div>
        {data.testCases.map((tc) => (
          <div
            key={tc.id}
            className="px-4 py-3 grid grid-cols-12 gap-3 text-sm border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40 transition-colors items-center"
          >
            <div className="col-span-1 font-mono text-xs text-zinc-500">{tc.id}</div>
            <div className="col-span-4 text-zinc-200">{tc.title}</div>
            <div className="col-span-2">
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{ color: ACCENT, borderColor: ACCENT + "40" }}
              >
                {tc.type}
              </span>
            </div>
            <div className="col-span-2">
              <span className={`text-xs font-mono ${PRIORITY_STYLES[tc.priority]}`}>
                {tc.priority}
              </span>
            </div>
            <div className="col-span-3 text-xs font-mono text-zinc-400 truncate" title={tc.expected}>
              {tc.expected}
            </div>
          </div>
        ))}
      </div>

      {/* 카테고리 칩 */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-zinc-500 font-mono">categories:</span>
        {data.coverage.categories.map((c) => (
          <span
            key={c}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}