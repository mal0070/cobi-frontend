'use client';

import { CopyButton } from '@/components/views/role/shared/CopyButton';
import { IssueCommentButton } from '@/components/views/role/shared/IssueCommentButton';
import { RoleHeader } from '@/components/views/role/shared/RoleHeader';
import type { LogicIR, RoleView as RoleViewType } from '@/types/api';
import {
  AlertTriangle,
  BarChart3,
  Check,
  CircleHelp,
  HelpCircle,
  Info,
  Lightbulb,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface PmViewProps {
  data: RoleViewType;
  logicIR: LogicIR;
  /**
   * sessionStorage 키 식별용.
   * storageKey가 바뀔 때 검증 상태를 새로 로드하려면
   * 부모에서 `<PmView key={storageKey} ... />` 로 전달.
   */
  storageKey?: string;
}

const PM_ACCENT = 'rgb(96 165 250)'; // blue-400

type Verification = 'match' | 'check' | 'mismatch';

interface VerificationState {
  status?: Verification;
  note?: string;
}

/**
 * sessionStorage에서 검증 상태 복원
 */
function loadVerificationsFromSession(
  key: string,
): Record<string, VerificationState> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, VerificationState>) : {};
  } catch {
    return {};
  }
}

/**
 * PM View - 제품 매니저를 위한 정책 매트릭스 + 검증 도구
 */
export function PmView({ data, logicIR, storageKey = 'default' }: PmViewProps) {
  const sessionKey = `cobi_pm_matrix_${storageKey}`;

  const [verifications, setVerifications] = useState<
    Record<string, VerificationState>
  >(() => loadVerificationsFromSession(sessionKey));

  useEffect(() => {
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(verifications));
    } catch {
      // 무시
    }
  }, [verifications, sessionKey]);

  const setStatus = (rowId: string, status: Verification) => {
    setVerifications((prev) => {
      const current = prev[rowId];
      if (current?.status === status) {
        const next = { ...prev };
        delete next[rowId];
        return next;
      }
      return { ...prev, [rowId]: { ...current, status } };
    });
  };

  // ============================================================
  // 통계
  // ============================================================
  const stats = useMemo(() => {
    let match = 0,
      check = 0,
      mismatch = 0;
    Object.values(verifications).forEach((v) => {
      if (v.status === 'match') match++;
      else if (v.status === 'check') check++;
      else if (v.status === 'mismatch') mismatch++;
    });
    const total = logicIR.branches.length;
    const done = match + check + mismatch;
    const pending = Math.max(0, total - done);
    return { match, check, mismatch, done, pending, total };
  }, [verifications, logicIR.branches]);

  // ============================================================
  // 행별 이슈 코멘트 생성
  // ============================================================
  const buildRowComment = (rowIndex: number): string => {
    const branch = logicIR.branches[rowIndex];
    const v = verifications[`row-${rowIndex}`];
    const status = v?.status;
    const statusLabel =
      status === 'match'
        ? '✅ 정책과 일치'
        : status === 'check'
          ? '⚠️ 확인 필요'
          : status === 'mismatch'
            ? '❌ 정책 불일치'
            : '☐ 미검증';

    const lines: string[] = [];
    lines.push(`### 정책 검증 - 분기 ${rowIndex + 1}`);
    lines.push('');
    lines.push(`**상태**: ${statusLabel}`);
    lines.push('');
    lines.push(`- **조건 변수**: ${branch.condition_var || '-'}`);
    lines.push(`- **조건**: \`${branch.condition}\``);
    lines.push(`- **결과**: ${branch.result}`);
    lines.push(`- **의미**: ${branch.plain_meaning}`);

    if (status === 'mismatch') {
      lines.push('');
      lines.push(
        '> 💬 이 분기가 의도한 정책과 다릅니다. 개발자 확인 요청드립니다.',
      );
    } else if (status === 'check') {
      lines.push('');
      lines.push('> 💬 이 분기의 정책 의도를 확인이 필요합니다.');
    }

    return lines.join('\n');
  };

  // ============================================================
  // 전체 리포트 생성
  // ============================================================
  const fullReport = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# ${data.title}`);
    lines.push('');
    lines.push(`> ${data.summary}`);
    lines.push('');
    lines.push('## 검증 진행률');
    lines.push('');
    lines.push(`- 전체 분기: **${stats.total}**`);
    lines.push(`- ✅ 일치: ${stats.match}`);
    lines.push(`- ⚠️ 확인 필요: ${stats.check}`);
    lines.push(`- ❌ 불일치: ${stats.mismatch}`);
    lines.push(`- ☐ 미검증: ${stats.pending}`);
    lines.push('');

    if (logicIR.branches.length > 0) {
      lines.push('## 정책 매트릭스');
      lines.push('');
      lines.push('| # | 조건 변수 | 조건 | 결과 | 검증 |');
      lines.push('|---|---|---|---|---|');
      logicIR.branches.forEach((b, i) => {
        const status = verifications[`row-${i}`]?.status;
        const mark =
          status === 'match'
            ? '✅'
            : status === 'check'
              ? '⚠️'
              : status === 'mismatch'
                ? '❌'
                : '☐';
        lines.push(
          `| ${i + 1} | ${escapePipe(b.condition_var || '-')} | \`${escapePipe(b.condition)}\` | ${escapePipe(b.result)} | ${mark} |`,
        );
      });
      lines.push('');
    }

    const mismatched = logicIR.branches
      .map((b, i) => ({ b, i, status: verifications[`row-${i}`]?.status }))
      .filter((x) => x.status === 'mismatch');

    if (mismatched.length > 0) {
      lines.push('## ❌ 정책 불일치 항목 (개발자 확인 필요)');
      lines.push('');
      mismatched.forEach(({ b, i }) => {
        lines.push(`### 분기 ${i + 1}: ${b.plain_meaning}`);
        lines.push(`- 조건: \`${b.condition}\``);
        lines.push(`- 결과: ${b.result}`);
        lines.push('');
      });
    }

    if (logicIR.edge_cases.length > 0) {
      lines.push('## 누락 가능 케이스');
      lines.push('');
      logicIR.edge_cases.forEach((e) => {
        lines.push(`- [ ] ${e}`);
      });
      lines.push('');
    }

    if (logicIR.uncertainties.length > 0) {
      lines.push('## 명확화 필요 항목');
      lines.push('');
      logicIR.uncertainties.forEach((u) => {
        lines.push(`- [ ] ${u}`);
      });
      lines.push('');
    }

    if (data.questions_to_confirm.length > 0) {
      lines.push('## 개발자에게 확인할 질문');
      lines.push('');
      data.questions_to_confirm.forEach((q) => {
        lines.push(`- [ ] ${q}`);
      });
    }

    return lines.join('\n');
  }, [data, logicIR, verifications, stats]);

  // ============================================================
  // 렌더
  // ============================================================
  const hasBranches = logicIR.branches.length > 0;

  return (
    <div className="space-y-5">
      <RoleHeader
        role="pm"
        roleLabel="PM"
        title={data.title}
        summary={data.summary}
        accent={PM_ACCENT}
        rightSlot={
          <CopyButton
            text={fullReport}
            label="전체 리포트 .md 복사"
            size="md"
            accent={PM_ACCENT}
          />
        }
      />

      {/* 진행률 바 */}
      {hasBranches && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: PM_ACCENT }} />
              <span className="text-sm font-semibold text-zinc-200">
                검증 진행률
              </span>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {stats.done} / {stats.total} 검증 완료
            </span>
          </div>
          <div className="h-2 rounded-full bg-zinc-900 overflow-hidden flex">
            <div
              className="h-full transition-all"
              style={{
                width: `${(stats.match / stats.total) * 100}%`,
                backgroundColor: PM_ACCENT,
              }}
              title={`일치 ${stats.match}`}
            />
            <div
              className="h-full bg-amber-500/80 transition-all"
              style={{ width: `${(stats.check / stats.total) * 100}%` }}
              title={`확인 필요 ${stats.check}`}
            />
            <div
              className="h-full bg-red-500/80 transition-all"
              style={{ width: `${(stats.mismatch / stats.total) * 100}%` }}
              title={`불일치 ${stats.mismatch}`}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-[11px] font-mono">
            <span style={{ color: PM_ACCENT }}>일치 {stats.match}</span>
            <span className="text-amber-400">확인 {stats.check}</span>
            <span className="text-red-400">불일치 {stats.mismatch}</span>
            <span className="text-zinc-500">미검증 {stats.pending}</span>
            <span className="text-zinc-600 ml-auto">
              {stats.total > 0
                ? ((stats.done / stats.total) * 100).toFixed(0)
                : 0}
              %
            </span>
          </div>
        </div>
      )}

      {/* 정책 매트릭스 */}
      {hasBranches ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4" style={{ color: PM_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">
              정책 매트릭스
            </h4>
            <span className="text-[10px] font-mono text-zinc-600">
              {logicIR.branches.length} BRANCHES
            </span>
            {stats.mismatch > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-300 border border-red-500/30">
                ❌ 불일치 {stats.mismatch}건 - 개발자 확인 필요
              </span>
            )}
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/60">
                    {/* 좌측 강조 바 영역 */}
                    <th className="w-1 p-0" aria-hidden="true" />
                    <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-zinc-500 w-10">
                      #
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      조건 변수
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      조건
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      결과
                    </th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-mono uppercase tracking-wider text-zinc-500 w-56">
                      검증 & 이슈
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logicIR.branches.map((branch, i) => {
                    const rowId = `row-${i}`;
                    const status = verifications[rowId]?.status;
                    return (
                      <MatrixRow
                        key={rowId}
                        index={i}
                        branch={branch}
                        status={status}
                        onChangeStatus={(s) => setStatus(rowId, s)}
                        rowMarkdown={buildRowComment(i)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
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
            아래 핵심 포인트와 확인 질문을 참고하세요.
          </p>
        </div>
      )}

      {/* 핵심 포인트 */}
      {data.key_points.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: PM_ACCENT }} />
            <h4 className="text-sm font-semibold text-zinc-200">정책 핵심</h4>
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
                  style={{ color: PM_ACCENT + '80' }}
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

      {/* 누락 가능 케이스 */}
      {logicIR.edge_cases.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-semibold text-zinc-200">
              누락 가능 케이스
            </h4>
            <span className="text-[10px] text-zinc-500">· 정책 보강 검토</span>
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
                <CopyButton text={edge} accent={PM_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 명확화 필요 항목 */}
      {logicIR.uncertainties.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CircleHelp className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-semibold text-zinc-200">명확화 필요</h4>
            <span className="text-[10px] text-red-400">· 개발자 확인 요청</span>
            <span className="text-[10px] font-mono text-zinc-600 ml-auto">
              {logicIR.uncertainties.length} ITEMS
            </span>
          </div>
          <ul className="space-y-2">
            {logicIR.uncertainties.map((u, i) => (
              <li
                key={i}
                className="flex gap-3 p-3 rounded-lg bg-red-950/10 border border-red-900/30"
              >
                <CircleHelp className="w-3.5 h-3.5 text-red-400/70 shrink-0 mt-0.5" />
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {u}
                </span>
                <CopyButton text={u} accent={PM_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 확인 질문 */}
      {data.questions_to_confirm.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4" style={{ color: PM_ACCENT }} />
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
                  style={{ color: PM_ACCENT + '80' }}
                >
                  Q.
                </span>
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {q}
                </span>
                <CopyButton text={q} accent={PM_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 매트릭스 행 컴포넌트
// ============================================================

interface MatrixRowProps {
  index: number;
  branch: LogicIR['branches'][number];
  status?: Verification;
  onChangeStatus: (status: Verification) => void;
  rowMarkdown: string;
}

function MatrixRow({
  index,
  branch,
  status,
  onChangeStatus,
  rowMarkdown,
}: MatrixRowProps) {
  // 행 톤 - 상태에 따라
  const rowBg =
    status === 'match'
      ? 'bg-blue-950/10'
      : status === 'check'
        ? 'bg-amber-950/10'
        : status === 'mismatch'
          ? 'bg-red-950/20'
          : '';

  // 좌측 강조 바 - 불일치만 빨간 컬러로, 확인필요는 앰버, 일치는 파랑, 미검증은 투명
  const leftBarColor =
    status === 'match'
      ? 'bg-blue-500/60'
      : status === 'check'
        ? 'bg-amber-500/70'
        : status === 'mismatch'
          ? 'bg-red-500'
          : 'bg-transparent';

  // 불일치 행은 좌측 강조 바를 더 두껍게
  const leftBarWidth = status === 'mismatch' ? 'w-1' : 'w-0.5';

  return (
    <tr
      className={`border-b border-zinc-800/60 last:border-0 transition-colors ${rowBg}`}
    >
      {/* 좌측 강조 바 */}
      <td className="p-0 relative">
        <div
          className={`absolute left-0 top-0 bottom-0 ${leftBarWidth} ${leftBarColor} transition-all`}
          aria-hidden="true"
        />
      </td>

      <td className="px-3 py-3 text-xs font-mono text-zinc-500 align-top">
        <div className="flex items-center gap-1.5">
          {status === 'mismatch' && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"
              aria-label="시급 액션"
              title="불일치 - 개발자 확인 필요"
            />
          )}
          {String(index + 1).padStart(2, '0')}
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <span className="text-sm text-zinc-200">
          {branch.condition_var || <span className="text-zinc-600">-</span>}
        </span>
      </td>
      <td className="px-3 py-3 align-top">
        <code className="text-xs font-mono text-zinc-300 bg-zinc-900/60 px-2 py-0.5 rounded break-all">
          {branch.condition}
        </code>
      </td>
      <td className="px-3 py-3 align-top">
        <div className="text-sm text-zinc-200">{branch.result}</div>
        {branch.plain_meaning && branch.plain_meaning !== branch.result && (
          <div className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
            {branch.plain_meaning}
          </div>
        )}
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-2 items-end">
          {/* 검증 상태 버튼 그룹 */}
          <div className="flex items-center gap-1">
            <VerifyButton
              active={status === 'match'}
              onClick={() => onChangeStatus('match')}
              color="blue"
              icon={<Check className="w-3.5 h-3.5" />}
              label="일치"
            />
            <VerifyButton
              active={status === 'check'}
              onClick={() => onChangeStatus('check')}
              color="amber"
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              label="확인"
            />
            <VerifyButton
              active={status === 'mismatch'}
              onClick={() => onChangeStatus('mismatch')}
              color="red"
              icon={<X className="w-3.5 h-3.5" />}
              label="불일치"
            />
          </div>
          {/* 이슈 만들기 버튼 - 검증 상태에 따라 강조도 */}
          <IssueCommentButton
            text={rowMarkdown}
            variant={status === 'mismatch' ? 'highlight' : 'default'}
          />
        </div>
      </td>
    </tr>
  );
}

interface VerifyButtonProps {
  active: boolean;
  onClick: () => void;
  color: 'blue' | 'amber' | 'red';
  icon: React.ReactNode;
  label: string;
}

function VerifyButton({
  active,
  onClick,
  color,
  icon,
  label,
}: VerifyButtonProps) {
  const colorMap = {
    blue: {
      active: 'bg-blue-500/20 border-blue-500/60 text-blue-300',
      idle: 'border-zinc-800 text-zinc-600 hover:border-blue-700 hover:text-blue-400',
    },
    amber: {
      active: 'bg-amber-500/20 border-amber-500/60 text-amber-300',
      idle: 'border-zinc-800 text-zinc-600 hover:border-amber-700 hover:text-amber-400',
    },
    red: {
      active: 'bg-red-500/20 border-red-500/60 text-red-300',
      idle: 'border-zinc-800 text-zinc-600 hover:border-red-700 hover:text-red-400',
    },
  };

  const cls = active ? colorMap[color].active : colorMap[color].idle;

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-7 h-7 rounded border transition-colors ${cls}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}

// ============================================================
// 유틸
// ============================================================

function escapePipe(text: string): string {
  return text.replace(/\|/g, '\\|');
}
