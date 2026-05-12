import type { RoleId } from "@/types/api";

interface RoleHeaderProps {
  role: RoleId;
  roleLabel: string;
  title: string;
  summary: string;
  accent: string;
  /** 우측 상단에 표시할 추가 정보 (예: 진행률) */
  rightSlot?: React.ReactNode;
}

/**
 * 직군별 View 공통 헤더
 *
 * - role 라벨 (액센트 컬러)
 * - 타이틀
 * - 요약
 * - 우측 슬롯 (선택)
 */
export function RoleHeader({
  role,
  roleLabel,
  title,
  summary,
  accent,
  rightSlot,
}: RoleHeaderProps) {
  return (
    <div className="pb-4 border-b border-zinc-800">
      <div className="flex items-start justify-between gap-4 mb-1.5">
        <p
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: accent }}
        >
          {roleLabel} VIEW
        </p>
        {rightSlot}
      </div>
      <h3 className="text-xl font-semibold text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{summary}</p>
    </div>
  );
}