'use client';

import { CopyButton } from '@/components/views/role/shared/CopyButton';
import { RoleHeader } from '@/components/views/role/shared/RoleHeader';
import type { LogicIR, RoleView as RoleViewType } from '@/types/api';
import {
  ChevronDown,
  HelpCircle,
  Info,
  Lightbulb,
  MessageCircle,
  MessageSquareWarning,
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface CsViewProps {
  data: RoleViewType;
  logicIR: LogicIR;
  storageKey?: string;
}

const CS_ACCENT = 'rgb(251 146 60)'; // orange-400

interface ScriptItem {
  /** 고유 id */
  id: string;
  /** 상황 (아코디언 헤더에 표시) */
  situation: string;
  /** 응대 본문 */
  reply: string;
  /** 조건 라벨 (선택) */
  conditionLabel?: string;
}

/**
 * CS View - 고객 응대팀을 위한 응대 스크립트 아코디언
 *
 * 협업 상황:
 * - CS는 고객 문의를 받으면 즉시 답변해야 함
 * - 코드 분기 = 발생 가능한 응대 상황
 * - 본문을 빠르게 복사해서 채팅/이메일에 붙여넣기
 * - 예외 상황은 별도 카드로 분리
 *
 * 구성:
 * - logic_ir.branches → 응대 스크립트 아코디언
 *   - 닫힘: 상황 한 줄 + 펼침 아이콘
 *   - 열림: 응대 본문 + 복사 버튼
 * - edge_cases → 예외 케이스 대응 (별도 섹션)
 * - key_points → 응대 핵심
 * - questions_to_confirm → FAQ 후보
 *
 * 격식체 고정. 사용자가 복사하는 건 응대 본문만 (인사말/맺음말 제외).
 */
export function CsView({ data, logicIR }: CsViewProps) {
  // ============================================================
  // 응대 스크립트 조립
  // ============================================================
  const scripts = useMemo<ScriptItem[]>(() => {
    return logicIR.branches.map((branch, i) => {
      // 상황: 결과 + plain_meaning을 조합해 CS가 한눈에 인지 가능하게
      const situation = branch.result;

      // 응대 본문: plain_meaning을 토대로 격식체 응대 문장 생성
      const reply = buildFormalReply(branch.plain_meaning, branch.result);

      // 조건 라벨: condition_var = true_label 형식
      const conditionLabel = branch.condition_var
        ? `${branch.condition_var}${branch.true_label ? ` = ${branch.true_label}` : ''}`
        : undefined;

      return {
        id: `script-${i}`,
        situation,
        reply,
        conditionLabel,
      };
    });
  }, [logicIR.branches]);

  // ============================================================
  // 아코디언 열림 상태 (메모리만, 영속 없음)
  // ============================================================
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const openAll = () => setOpenIds(new Set(scripts.map((s) => s.id)));
  const closeAll = () => setOpenIds(new Set());

  // ============================================================
  // 전체 매뉴얼 마크다운
  // ============================================================
  const fullManual = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# 고객 응대 매뉴얼: ${data.title}`);
    lines.push('');
    lines.push(`> ${data.summary}`);
    lines.push('');

    if (scripts.length > 0) {
      lines.push(`## 응대 스크립트 (${scripts.length}개)`);
      lines.push('');
      scripts.forEach((s, i) => {
        lines.push(`### ${i + 1}. ${s.situation}`);
        if (s.conditionLabel) {
          lines.push(`*조건: ${s.conditionLabel}*`);
        }
        lines.push('');
        lines.push(`> ${s.reply}`);
        lines.push('');
      });
    }

    if (data.key_points.length > 0) {
      lines.push('## 응대 핵심');
      lines.push('');
      data.key_points.forEach((p) => lines.push(`- ${p}`));
      lines.push('');
    }

    if (logicIR.edge_cases.length > 0) {
      lines.push('## 예외 케이스 대응');
      lines.push('');
      logicIR.edge_cases.forEach((e) => lines.push(`- ${e}`));
      lines.push('');
    }

    if (data.questions_to_confirm.length > 0) {
      lines.push('## FAQ 후보');
      lines.push('');
      data.questions_to_confirm.forEach((q) => lines.push(`- ${q}`));
    }

    return lines.join('\n');
  }, [data, scripts, logicIR.edge_cases]);

  const hasScripts = scripts.length > 0;

  // ============================================================
  // 렌더
  // ============================================================
  return (
    <div className="space-y-5">
      <RoleHeader
        role="cs"
        roleLabel="CS"
        title={data.title}
        summary={data.summary}
        accent={CS_ACCENT}
        rightSlot={
          <CopyButton
            text={fullManual}
            label="응대 매뉴얼 .md 복사"
            size="md"
            accent={CS_ACCENT}
          />
        }
      />

      {/* 응대 스크립트 아코디언 */}
      {hasScripts ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-4 h-4" style={{ color: CS_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">
              응대 스크립트
            </h4>
            <span className="text-[10px] font-mono text-zinc-600">
              {scripts.length} SCRIPTS
            </span>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={openAll}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                모두 펼치기
              </button>
              <span className="text-zinc-700">·</span>
              <button
                onClick={closeAll}
                className="text-[11px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                모두 접기
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {scripts.map((script, i) => (
              <ScriptAccordion
                key={script.id}
                index={i}
                script={script}
                isOpen={openIds.has(script.id)}
                onToggle={() => toggle(script.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-6 text-center">
          <Info className="w-6 h-6 mx-auto mb-2 text-zinc-500" />
          <p className="text-sm text-zinc-400">
            조건 분기가 없는 단순 로직입니다.
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            상황별 응대 스크립트 대신 아래 핵심 안내를 참고하세요.
          </p>
        </div>
      )}

      {/* 응대 핵심 */}
      {data.key_points.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: CS_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">응대 핵심</h4>
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
                  style={{ color: CS_ACCENT + '80' }}
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

      {/* 예외 케이스 대응 */}
      {logicIR.edge_cases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareWarning className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-zinc-200">
              예외 케이스 대응
            </h4>
            <span className="text-[10px] text-zinc-500">
              · 일반 응대로 처리 어려운 경우
            </span>
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
                <MessageSquareWarning className="w-3.5 h-3.5 text-amber-400/70 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {edge}
                </span>
                <CopyButton text={edge} accent={CS_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* FAQ 후보 */}
      {data.questions_to_confirm.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4" style={{ color: CS_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">FAQ 후보</h4>
            <span className="text-[10px] text-zinc-500">
              · 자주 들어올 가능성 있는 문의
            </span>
            <span className="text-[10px] font-mono text-zinc-600 ml-auto">
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
                  style={{ color: CS_ACCENT + '80' }}
                >
                  Q.
                </span>
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {q}
                </span>
                <CopyButton text={q} accent={CS_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 아코디언 컴포넌트
// ============================================================

interface ScriptAccordionProps {
  index: number;
  script: ScriptItem;
  isOpen: boolean;
  onToggle: () => void;
}

function ScriptAccordion({
  index,
  script,
  isOpen,
  onToggle,
}: ScriptAccordionProps) {
  return (
    <div
      className={`rounded-lg border bg-zinc-950/40 overflow-hidden transition-colors ${
        isOpen
          ? 'border-orange-500/40'
          : 'border-zinc-800/80 hover:border-zinc-700'
      }`}
    >
      {/* 아코디언 헤더 - 상황 */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
        aria-expanded={isOpen}
      >
        <span
          className="text-[10px] font-mono shrink-0"
          style={{ color: CS_ACCENT + '80' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-zinc-200 leading-snug">
            {script.situation}
          </div>
          {script.conditionLabel && (
            <div className="text-[11px] font-mono text-zinc-500 mt-0.5">
              {script.conditionLabel}
            </div>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 아코디언 본문 - 응대 메시지 */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-zinc-800/60">
          {/* 응대 메시지 (말풍선 스타일) */}
          <div className="mt-3">
            <div className="flex items-center gap-1.5 mb-2">
              <MessageCircle
                className="w-3 h-3"
                style={{ color: CS_ACCENT + 'B0' }}
              />
              <span
                className="text-[10px] font-mono uppercase tracking-wider"
                style={{ color: CS_ACCENT + 'B0' }}
              >
                응대 메시지
              </span>
            </div>

            {/* 메시지 카드 - 채팅 말풍선 느낌 */}
            <div className="relative rounded-xl rounded-tl-sm bg-orange-500/8 border border-orange-500/25 p-4">
              <p className="text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap">
                {script.reply}
              </p>
            </div>

            {/* 복사 버튼 */}
            <div className="flex justify-end mt-2">
              <CopyButton
                text={script.reply}
                label="응대 메시지 복사"
                size="sm"
                accent={CS_ACCENT}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 응대 문장 생성 유틸
// ============================================================

/**
 * plain_meaning을 격식체 응대 문장으로 변환
 *
 * 백엔드의 plain_meaning은 대체로 설명문 형태이므로
 * 고객 응대용으로 자연스러운 격식체 문장으로 다듬음.
 *
 * 한국어가 아닌 경우(영어 등)는 그대로 사용.
 */
function buildFormalReply(plainMeaning: string, _result: string): string {
  const text = plainMeaning.trim();
  if (!text) return '';

  // 한국어 여부 간단 판단 (한글 포함)
  const hasKorean = /[\uac00-\ud7a3]/.test(text);

  if (!hasKorean) {
    // 영어 등: 그대로 사용
    return text;
  }

  // 한국어: 격식체로 마무리 (이미 격식체면 그대로)
  // 끝이 ".", "다.", "요.", "니다." 등이면 그대로 사용
  if (/(다|요|까|죠)\.?\s*$/.test(text) || /[!?]\s*$/.test(text)) {
    return ensureSentenceEnd(text);
  }

  // 평이한 종결(예: "...됩니다", "...입니다")이면 그대로
  if (/(됩니다|입니다|있습니다|드립니다|드리겠습니다)\.?\s*$/.test(text)) {
    return ensureSentenceEnd(text);
  }

  // 기본: 그대로 두되 마침표만 보정
  return ensureSentenceEnd(text);
}

/** 문장 끝에 마침표 보정 */
function ensureSentenceEnd(text: string): string {
  const trimmed = text.trim();
  if (/[.!?。]$/.test(trimmed)) return trimmed;
  return trimmed + '.';
}
