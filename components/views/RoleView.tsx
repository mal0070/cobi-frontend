import type { LogicIR, RoleId, RoleView as RoleViewType } from "@/types/api";
import { CheckCircle2, HelpCircle } from "lucide-react";
import { PmView } from "./role/PmView";
import { QaView } from "./role/QaView";

interface Props {
  data: RoleViewType;
  role: RoleId;
  /** 직군별 View가 logic_ir의 branches/edge_cases/uncertainties 등을 활용 */
  logicIR: LogicIR;
  /** sessionStorage 키 식별용 */
  storageKey?: string;
}

const ROLE_ACCENT: Record<RoleId, string> = {
  pm: "rgb(96 165 250)",
  designer: "rgb(244 114 182)",
  qa: "rgb(52 211 153)",
  cs: "rgb(251 146 60)",
};

/**
 * 직군별 View 라우터
 *
 * 각 직군은 협업 상황이 다르므로 전용 컴포넌트로 분기.
 * 아직 분리되지 않은 직군은 LegacyRoleView로 폴백.
 *
 * `key={storageKey}` 패턴: storageKey가 바뀌면 컴포넌트를 리마운트시켜
 * lazy initializer가 재실행되도록 함 (effect 내 setState 회피).
 */
export function RoleView({ data, role, logicIR, storageKey }: Props) {
  // QA: 인터랙티브 체크리스트
  if (role === "qa") {
    return (
      <QaView
        key={storageKey}
        data={data}
        logicIR={logicIR}
        storageKey={storageKey}
      />
    );
  }

  // PM: 정책 매트릭스 + 검증
  if (role === "pm") {
    return (
      <PmView
        key={storageKey}
        data={data}
        logicIR={logicIR}
        storageKey={storageKey}
      />
    );
  }

  // Designer / CS: 추후 전용 컴포넌트로 교체 예정
  return <LegacyRoleView data={data} role={role} />;
}

// ============================================================
// Legacy View - 아직 직군 전용 컴포넌트가 없는 경우 폴백
// ============================================================

function LegacyRoleView({ data, role }: { data: RoleViewType; role: RoleId }) {
  const accent = ROLE_ACCENT[role];

  return (
    <div className="space-y-5">
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