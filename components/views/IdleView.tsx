import type { RoleId } from "@/types/api";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Headphones,
  Palette,
  Play
} from "lucide-react";

export const ROLES: Array<{
  id: RoleId;
  label: string;
  subtitle: string;
  desc: string;
  icon: typeof BarChart3;
  accent: string;
}> = [
  {
    id: "pm",
    label: "PM",
    subtitle: "제품 매니저",
    desc: "비즈니스 정책",
    icon: BarChart3,
    accent: "rgb(96 165 250)",
  },
  {
    id: "designer",
    label: "Designer",
    subtitle: "디자이너",
    desc: "사용자 경험",
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
  {
    id: "cs",
    label: "CS",
    subtitle: "고객 지원",
    desc: "고객 안내",
    icon: Headphones,
    accent: "rgb(251 146 60)",
  },
];

export function IdleHero() {
  return (
    <div className="relative mb-10 flex flex-col items-center overflow-hidden py-8">
      {/* 흘러가는 배경 텍스트 */}
      <div
        className="absolute inset-0 flex opacity-20 pointer-events-none select-none"
        aria-hidden="true"
      >
        <div
          className="flex whitespace-nowrap"
          style={{ animation: "marquee 22s linear infinite" }}
        >
          {[0, 1].map((i) => (
            <span key={i} className="text-7xl font-bold tracking-tighter">
              {[0, 1, 2, 3].map((j) => (
                <span key={j}>
                  <span className="text-zinc-300">Co</span>
                  <span className="text-zinc-600">de&nbsp;</span>
                  <span className="text-zinc-300">B</span>
                   <span className="text-zinc-600">r&nbsp;</span>
                  <span className="text-zinc-300">i</span>
                  <span className="text-zinc-600">dge&nbsp;·&nbsp;</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* 전경 텍스트 */}
      <div className="relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 leading-tight">
          코드를 붙여넣고,
          <br />
          <span className="text-emerald-200">팀원의 언어로 번역하세요.</span>
        </h2>
        <p className="text-zinc-500 max-w-xl text-sm leading-relaxed">
          조건 분기와 로직을 PM, 디자이너, QA, CS가 빠르게 이해할 수 있는
          <br className="hidden md:block" />
          플로우차트와 직군별 시나리오로 자동 변환합니다.
        </p>
      </div>
    </div>
  );
}

interface IdleActionsProps {
  code: string;
  selectedRoles: RoleId[];
  onToggleRole: (id: RoleId) => void;
  onAnalyze: () => void;
}

export function IdleActions({ code, selectedRoles, onToggleRole, onAnalyze }: IdleActionsProps) {
  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            분석할 직군 선택
          </h3>
          <span className="text-xs text-zinc-600">{selectedRoles.length}/4 선택됨</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRoles.includes(role.id);
            return (
              <button
                key={role.id}
                onClick={() => onToggleRole(role.id)}
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold text-zinc-100">{role.label}</span>
                      <span className="text-[11px] text-zinc-500">{role.subtitle}</span>
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
        onClick={onAnalyze}
        disabled={!code.trim()}
        className="w-full py-4 rounded-xl bg-zinc-100 text-zinc-900 font-medium text-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group"
      >
        <Play className="w-4 h-4" fill="currentColor" />
        분석하기
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </section>
  );
}
