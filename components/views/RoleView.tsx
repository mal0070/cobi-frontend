import type { RoleId, RoleView as RoleViewType } from "@/types/api";
import { CheckCircle2, HelpCircle } from "lucide-react";

interface Props {
  data: RoleViewType;
  role: RoleId;
}

const ROLE_ACCENT: Record<RoleId, string> = {
  pm: "rgb(96 165 250)",      // blue-400
  designer: "rgb(244 114 182)", // pink-400
  qa: "rgb(52 211 153)",       // emerald-400
  cs: "rgb(251 146 60)",       // orange-400
};

/**
 * 직군별 View 컴포넌트
 *
 * 백엔드의 RoleView 구조는 모든 직군(PM/Designer/QA/CS)이 동일하므로
 * 단일 컴포넌트로 처리. 액센트 컬러만 role에 따라 다르게 표시.
 */
export function RoleView({ data, role }: Props) {
  const accent = ROLE_ACCENT[role];

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="pb-4 border-b border-zinc-800">
        <p
          className="text-[10px] font-mono uppercase tracking-wider mb-1.5"
          style={{ color: accent }}
        >
          {role.toUpperCase()} VIEW
        </p>
        <h3 className="text-xl font-semibold text-zinc-100 mb-2">{data.title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed">{data.summary}</p>
      </div>

      {/* Key Points */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4" style={{ color: accent }} />
          <h4 className="text-sm font-semibold text-zinc-200">핵심 포인트</h4>
          <span className="text-[10px] font-mono text-zinc-600">
            {data.key_points.length} ITEMS
          </span>
        </div>
        <ul className="space-y-2">
          {data.key_points.map((point, i) => (
            <li
              key={i}
              className="flex gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
            >
              <span
                className="text-xs font-mono text-zinc-600 shrink-0 mt-0.5 w-6"
                style={{ color: accent + "80" }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm text-zinc-200 leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Questions to Confirm */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4" style={{ color: accent }} />
          <h4 className="text-sm font-semibold text-zinc-200">확인할 질문</h4>
          <span className="text-[10px] font-mono text-zinc-600">
            {data.questions_to_confirm.length} ITEMS
          </span>
        </div>
        <ul className="space-y-2">
          {data.questions_to_confirm.map((q, i) => (
            <li
              key={i}
              className="flex gap-3 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/80"
            >
              <span
                className="text-zinc-600 shrink-0 mt-0.5"
                style={{ color: accent + "80" }}
              >
                Q.
              </span>
              <span className="text-sm text-zinc-300 leading-relaxed">{q}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}