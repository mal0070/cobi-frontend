'use client';

import { CopyButton } from '@/components/views/role/shared/CopyButton';
import { RoleHeader } from '@/components/views/role/shared/RoleHeader';
import type { LogicIR, RoleView as RoleViewType } from '@/types/api';
import {
  AlertTriangle,
  Eye,
  HelpCircle,
  Info,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';

interface DesignerViewProps {
  data: RoleViewType;
  logicIR: LogicIR;
  storageKey?: string;
}

const DESIGNER_ACCENT = 'rgb(244 114 182)'; // pink-400

/**
 * Designer View - 디자이너를 위한 상태 카드 갤러리
 *
 * 협업 상황:
 * - 디자이너는 추상 다이어그램(flowchart)이 부담스러움
 * - 각 분기 결과 = 시안이 필요한 화면 상태
 * - "이 상태일 때 어떤 UI를 그려야 하지?"에 답해야 함
 *
 * 구성:
 * - logic_ir.branches → 상태 카드 갤러리 (장자도 그리드)
 * - 각 카드: 상태 라벨 + 사용자 관점 한 줄 + 진입 조건
 * - Designer 관점 key_points
 * - edge_cases (누락 가능 상태)
 * - questions_to_confirm
 *
 * 작업 흐름:
 * - 디자이너가 코드 결과(분기)를 카드로 한눈에 파악
 * - 카드별로 시안 작업 → 추후 시안 첨부 기능 추가 예정
 */
export function DesignerView({ data, logicIR }: DesignerViewProps) {
  // ============================================================
  // 카드별 마크다운 (브리핑 노트 복사용)
  // ============================================================
  const buildCardMarkdown = (index: number): string => {
    const branch = logicIR.branches[index];
    const lines: string[] = [];
    lines.push(`### 상태 ${index + 1}: ${branch.result}`);
    lines.push('');
    lines.push(`**사용자가 보는 것**: ${branch.plain_meaning}`);
    lines.push('');

    const conditionLine = branch.condition_var
      ? `**진입 조건**: ${branch.condition_var}${branch.true_label ? ` = ${branch.true_label}` : ''}`
      : `**진입 조건**: ${branch.condition}`;
    lines.push(conditionLine);

    return lines.join('\n');
  };

  // ============================================================
  // 전체 디자인 브리핑 마크다운
  // ============================================================
  const fullBriefing = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# 디자인 브리핑: ${data.title}`);
    lines.push('');
    lines.push(`> ${data.summary}`);
    lines.push('');

    if (logicIR.branches.length > 0) {
      lines.push(`## 시안이 필요한 상태 (${logicIR.branches.length}개)`);
      lines.push('');
      logicIR.branches.forEach((b, i) => {
        lines.push(`### ${i + 1}. ${b.result}`);
        lines.push(`- **사용자가 보는 것**: ${b.plain_meaning}`);
        const cond = b.condition_var
          ? `${b.condition_var}${b.true_label ? ` = ${b.true_label}` : ''}`
          : b.condition;
        lines.push(`- **진입 조건**: ${cond}`);
        lines.push('');
      });
    }

    if (data.key_points.length > 0) {
      lines.push('## UI 단서');
      lines.push('');
      data.key_points.forEach((p) => lines.push(`- ${p}`));
      lines.push('');
    }

    if (logicIR.edge_cases.length > 0) {
      lines.push('## 시안에서 놓치기 쉬운 케이스');
      lines.push('');
      logicIR.edge_cases.forEach((e) => lines.push(`- [ ] ${e}`));
      lines.push('');
    }

    if (data.questions_to_confirm.length > 0) {
      lines.push('## 확인 질문');
      lines.push('');
      data.questions_to_confirm.forEach((q) => lines.push(`- [ ] ${q}`));
    }

    return lines.join('\n');
  }, [data, logicIR]);

  const hasBranches = logicIR.branches.length > 0;

  // ============================================================
  // 렌더
  // ============================================================
  return (
    <div className="space-y-5">
      <RoleHeader
        role="designer"
        roleLabel="DESIGNER"
        title={data.title}
        summary={data.summary}
        accent={DESIGNER_ACCENT}
        rightSlot={
          <CopyButton
            text={fullBriefing}
            label="디자인 브리핑 .md 복사"
            size="md"
            accent={DESIGNER_ACCENT}
          />
        }
      />

      {/* 상태 카드 갤러리 */}
      {hasBranches ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" style={{ color: DESIGNER_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">
              시안이 필요한 상태
            </h4>
            <span className="text-[10px] font-mono text-zinc-600">
              {logicIR.branches.length} STATES
            </span>
          </div>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {logicIR.branches.map((branch, i) => (
              <StateCard
                key={i}
                index={i}
                branch={branch}
                cardMarkdown={buildCardMarkdown(i)}
              />
            ))}
          </div>
        </div>
      ) : (
        // 조건 없는 단순 로직 폴백
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-6 text-center">
          <Info className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
          <p className="text-sm text-zinc-400">
            조건 분기가 없는 단순 로직입니다.
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            단일 상태만 다루므로 별도 분기 시안은 필요 없을 수 있어요.
          </p>
        </div>
      )}

      {/* UI 단서 (key_points) */}
      {data.key_points.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: DESIGNER_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">UI 단서</h4>
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
                  className="text-xs font-mono shrink-0 mt-0.5 w-6"
                  style={{ color: DESIGNER_ACCENT + '80' }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-sm text-zinc-200 leading-relaxed">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 시안에서 놓치기 쉬운 케이스 */}
      {logicIR.edge_cases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-zinc-200">
              놓치기 쉬운 케이스
            </h4>
            <span className="text-[10px] text-zinc-500">· 시안 누락 방지</span>
            <span className="text-[10px] font-mono text-zinc-600 ml-auto">
              {logicIR.edge_cases.length} ITEMS
            </span>
          </div>
          <ul className="space-y-2">
            {logicIR.edge_cases.map((edge, i) => (
              <li
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-amber-950/10 border border-amber-900/30"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {edge}
                </span>
                <CopyButton text={edge} accent={DESIGNER_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 확인 질문 */}
      {data.questions_to_confirm.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle
              className="w-4 h-4"
              style={{ color: DESIGNER_ACCENT }}
            />
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
                  className="shrink-0 mt-0.5"
                  style={{ color: DESIGNER_ACCENT + '80' }}
                >
                  Q.
                </span>
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {q}
                </span>
                <CopyButton text={q} accent={DESIGNER_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 상태 카드 컴포넌트
// ============================================================

interface StateCardProps {
  index: number;
  branch: LogicIR['branches'][number];
  cardMarkdown: string;
}

function StateCard({ index, branch, cardMarkdown }: StateCardProps) {
  // 상태 라벨 - true_label이 있으면 우선 사용 (짧고 명확한 상태명)
  const stateLabel = branch.true_label || branch.result;

  // 진입 조건 표현 - 디자이너용으로 평이하게
  const conditionDisplay = branch.condition_var ? (
    <span>
      <span className="text-zinc-300">{branch.condition_var}</span>
      {branch.true_label && (
        <>
          <span className="text-zinc-600 mx-1">=</span>
          <span className="text-zinc-300">{branch.true_label}</span>
        </>
      )}
    </span>
  ) : (
    <code className="text-[11px] font-mono text-zinc-400">
      {branch.condition}
    </code>
  );

  return (
    <div className="group rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden hover:border-pink-500/40 transition-colors">
      {/* 카드 헤더 */}
      <div className="px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="text-[10px] font-mono shrink-0"
            style={{ color: DESIGNER_ACCENT + '80' }}
          >
            STATE {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <CopyButton
          text={cardMarkdown}
          accent={DESIGNER_ACCENT}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* 카드 본문 */}
      <div className="p-4 space-y-3">
        {/* 상태 라벨 - 큰 글씨 */}
        <div>
          <div
            className="text-[10px] font-mono uppercase tracking-wider mb-1"
            style={{ color: DESIGNER_ACCENT }}
          >
            상태
          </div>
          <h5 className="text-base font-semibold text-zinc-100 leading-tight break-words">
            {stateLabel}
          </h5>
        </div>

        {/* 사용자가 보는 것 */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Eye
              className="w-3 h-3"
              style={{ color: DESIGNER_ACCENT + 'B0' }}
            />
            <div
              className="text-[10px] font-mono uppercase tracking-wider"
              style={{ color: DESIGNER_ACCENT + 'B0' }}
            >
              사용자가 보는 것
            </div>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {branch.plain_meaning}
          </p>
        </div>

        {/* 진입 조건 */}
        <div className="pt-2 border-t border-zinc-800/60">
          <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1">
            진입 조건
          </div>
          <div className="text-xs leading-relaxed">{conditionDisplay}</div>
        </div>
      </div>
    </div>
  );
}
