"use client";

import { CopyButton } from "@/components/views/role/shared/CopyButton";
import { RoleHeader } from "@/components/views/role/shared/RoleHeader";
import type { LogicIR, RoleView as RoleViewType } from "@/types/api";
import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  HelpCircle,
  Minus,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface QaViewProps {
  data: RoleViewType;
  logicIR: LogicIR;
  /**
   * sessionStorage 키 식별용.
   * 이 값이 바뀔 때 체크리스트 상태를 새로 로드하려면
   * 부모 컴포넌트에서 `<QaView key={storageKey} ... />` 처럼
   * key prop으로 전달해 컴포넌트를 리마운트시키세요.
   */
  storageKey?: string;
}

const QA_ACCENT = "rgb(52 211 153)"; // emerald-400

type CaseStatus = "pending" | "pass" | "fail" | "skip";

interface TestCase {
  id: string;
  /** 카테고리: 핵심 / 경계값 / 확인필요 */
  category: "core" | "edge" | "uncertain";
  /** 본문 텍스트 */
  text: string;
  /** Given-When-Then 자동 생성용 (branches에서 온 경우만) */
  gwt?: {
    given: string;
    when: string;
    then: string;
  };
}

/**
 * sessionStorage에서 체크리스트 상태 복원
 * - SSR 환경(window 미존재)에서는 빈 객체 반환
 * - 클라이언트 첫 렌더 시 lazy initializer로 동기 주입
 */
function loadStatusesFromSession(key: string): Record<string, CaseStatus> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, CaseStatus>) : {};
  } catch {
    return {};
  }
}

/**
 * QA View - QA 엔지니어를 위한 인터랙티브 체크리스트
 *
 * 기능:
 * - logic_ir.branches → Given-When-Then 시나리오 자동 생성
 * - key_points / edge_cases / uncertainties를 카테고리별로 묶어 체크리스트화
 * - Pass/Fail/Skip 3-state (sessionStorage 영속)
 * - 진행률 표시
 * - 마크다운 일괄 복사 (지라/노션 붙여넣기용)
 *
 * 주의: 분석 결과가 바뀌었을 때(다른 코드 → 다른 storageKey) 체크리스트를
 * 새로 로드하려면 부모에서 `<QaView key={storageKey} ... />` 로 전달하세요.
 * 그러면 React가 컴포넌트를 새로 마운트하면서 lazy initializer가 재실행됩니다.
 */
export function QaView({ data, logicIR, storageKey = "default" }: QaViewProps) {
  // ============================================================
  // 테스트 케이스 조립
  // ============================================================
  const testCases = useMemo<TestCase[]>(() => {
    const cases: TestCase[] = [];

    // 1. branches → Given-When-Then 시나리오
    logicIR.branches.forEach((branch, i) => {
      const given =
        logicIR.inputs.length > 0
          ? `${logicIR.inputs.join(", ")} 입력이 주어졌고`
          : "초기 상태에서";
      const when = branch.condition;
      const then = `${branch.result} (${branch.plain_meaning})`;

      cases.push({
        id: `branch-${i}`,
        category: "core",
        text: branch.plain_meaning,
        gwt: { given, when, then },
      });
    });

    // 2. key_points
    data.key_points.forEach((point, i) => {
      cases.push({
        id: `point-${i}`,
        category: "core",
        text: point,
      });
    });

    // 3. edge_cases
    logicIR.edge_cases.forEach((edge, i) => {
      cases.push({
        id: `edge-${i}`,
        category: "edge",
        text: edge,
      });
    });

    // 4. uncertainties
    logicIR.uncertainties.forEach((u, i) => {
      cases.push({
        id: `uncertain-${i}`,
        category: "uncertain",
        text: u,
      });
    });

    return cases;
  }, [data, logicIR]);

  // ============================================================
  // 상태 (sessionStorage 영속)
  // ============================================================
  const sessionKey = `cobi_qa_checklist_${storageKey}`;

  // lazy initializer: 마운트 시 단 한 번만 sessionStorage 읽음.
  // storageKey가 바뀌면 부모에서 key prop으로 리마운트시키므로
  // 이 함수가 새 키로 다시 호출됨.
  const [statuses, setStatuses] = useState<Record<string, CaseStatus>>(() =>
    loadStatusesFromSession(sessionKey),
  );

  // 저장 (외부 시스템으로 상태 푸시 - effect의 정석 용법, setState 없음)
  useEffect(() => {
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify(statuses));
    } catch {
      // 무시
    }
  }, [statuses, sessionKey]);

  const setStatus = (id: string, status: CaseStatus) => {
    setStatuses((prev) => {
      // 같은 버튼 다시 누르면 pending으로 복귀
      if (prev[id] === status) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: status };
    });
  };

  // ============================================================
  // 진행률
  // ============================================================
  const stats = useMemo(() => {
    let pass = 0,
      fail = 0,
      skip = 0;
    Object.values(statuses).forEach((s) => {
      if (s === "pass") pass++;
      else if (s === "fail") fail++;
      else if (s === "skip") skip++;
    });
    const done = pass + fail + skip;
    const total = testCases.length;
    const ratio = total > 0 ? done / total : 0;
    return { pass, fail, skip, done, total, ratio };
  }, [statuses, testCases]);

  // ============================================================
  // 마크다운 생성
  // ============================================================
  const markdown = useMemo(() => {
    const lines: string[] = [];
    lines.push(`# ${data.title}`);
    lines.push("");
    lines.push(`> ${data.summary}`);
    lines.push("");
    lines.push(
      `**진행률**: ${stats.done}/${stats.total} (Pass ${stats.pass} / Fail ${stats.fail} / Skip ${stats.skip})`,
    );
    lines.push("");

    const cats: Array<{ key: TestCase["category"]; title: string }> = [
      { key: "core", title: "## 핵심 테스트 케이스" },
      { key: "edge", title: "## 경계값 & 예외" },
      { key: "uncertain", title: "## ⚠ 확인 필요 (개발자에게 문의)" },
    ];

    cats.forEach(({ key, title }) => {
      const items = testCases.filter((t) => t.category === key);
      if (items.length === 0) return;

      lines.push(title);
      lines.push("");

      items.forEach((t, i) => {
        const status = statuses[t.id] ?? "pending";
        const mark =
          status === "pass"
            ? "✅"
            : status === "fail"
              ? "❌"
              : status === "skip"
                ? "⏭️"
                : "☐";
        lines.push(`- ${mark} **TC-${i + 1}**: ${t.text}`);
        if (t.gwt) {
          lines.push(`  - **Given**: ${t.gwt.given}`);
          lines.push(`  - **When**: ${t.gwt.when}`);
          lines.push(`  - **Then**: ${t.gwt.then}`);
        }
      });
      lines.push("");
    });

    if (data.questions_to_confirm.length > 0) {
      lines.push("## 개발자에게 확인할 질문");
      lines.push("");
      data.questions_to_confirm.forEach((q) => {
        lines.push(`- [ ] ${q}`);
      });
    }

    return lines.join("\n");
  }, [data, testCases, statuses, stats]);

  // ============================================================
  // 렌더
  // ============================================================
  const coreCount = testCases.filter((t) => t.category === "core").length;
  const edgeCount = testCases.filter((t) => t.category === "edge").length;
  const uncertainCount = testCases.filter(
    (t) => t.category === "uncertain",
  ).length;

  return (
    <div className="space-y-5">
      <RoleHeader
        role="qa"
        roleLabel="QA"
        title={data.title}
        summary={data.summary}
        accent={QA_ACCENT}
        rightSlot={
          <CopyButton
            text={markdown}
            label="테스트 케이스 .md 복사"
            size="md"
            accent={QA_ACCENT}
          />
        }
      />

      {/* 진행률 바 */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" style={{ color: QA_ACCENT }} />
            <span className="text-sm font-semibold text-zinc-200">진행률</span>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {stats.done} / {stats.total} 완료
          </span>
        </div>
        <div className="h-2 rounded-full bg-zinc-900 overflow-hidden flex">
          {stats.total > 0 && (
            <>
              <div
                className="h-full transition-all"
                style={{
                  width: `${(stats.pass / stats.total) * 100}%`,
                  backgroundColor: QA_ACCENT,
                }}
                title={`Pass ${stats.pass}`}
              />
              <div
                className="h-full bg-red-500/80 transition-all"
                style={{ width: `${(stats.fail / stats.total) * 100}%` }}
                title={`Fail ${stats.fail}`}
              />
              <div
                className="h-full bg-zinc-600 transition-all"
                style={{ width: `${(stats.skip / stats.total) * 100}%` }}
                title={`Skip ${stats.skip}`}
              />
            </>
          )}
        </div>
        <div className="flex items-center gap-4 mt-2 text-[11px] font-mono">
          <span className="text-emerald-400">Pass {stats.pass}</span>
          <span className="text-red-400">Fail {stats.fail}</span>
          <span className="text-zinc-500">Skip {stats.skip}</span>
          <span className="text-zinc-600 ml-auto">
            {(stats.ratio * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* 핵심 테스트 케이스 */}
      {coreCount > 0 && (
        <CaseSection
          title="핵심 테스트 케이스"
          count={coreCount}
          icon={
            <ClipboardCheck className="w-4 h-4" style={{ color: QA_ACCENT }} />
          }
          cases={testCases.filter((t) => t.category === "core")}
          statuses={statuses}
          onChangeStatus={setStatus}
        />
      )}

      {/* 경계값 & 예외 */}
      {edgeCount > 0 && (
        <CaseSection
          title="경계값 & 예외"
          count={edgeCount}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
          cases={testCases.filter((t) => t.category === "edge")}
          statuses={statuses}
          onChangeStatus={setStatus}
        />
      )}

      {/* 확인 필요 */}
      {uncertainCount > 0 && (
        <CaseSection
          title="확인 필요"
          subtitle="개발자에게 명확화 요청"
          count={uncertainCount}
          icon={<AlertTriangle className="w-4 h-4 text-red-400" />}
          highlight="red"
          cases={testCases.filter((t) => t.category === "uncertain")}
          statuses={statuses}
          onChangeStatus={setStatus}
        />
      )}

      {/* 확인 질문 */}
      {data.questions_to_confirm.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <HelpCircle className="w-4 h-4" style={{ color: QA_ACCENT }} />
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
                  style={{ color: QA_ACCENT + "80" }}
                >
                  Q.
                </span>
                <span className="text-sm text-zinc-300 leading-relaxed flex-1">
                  {q}
                </span>
                <CopyButton text={q} accent={QA_ACCENT} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================================
// 하위 컴포넌트
// ============================================================

interface CaseSectionProps {
  title: string;
  subtitle?: string;
  count: number;
  icon: React.ReactNode;
  highlight?: "red";
  cases: TestCase[];
  statuses: Record<string, CaseStatus>;
  onChangeStatus: (id: string, status: CaseStatus) => void;
}

function CaseSection({
  title,
  subtitle,
  count,
  icon,
  highlight,
  cases,
  statuses,
  onChangeStatus,
}: CaseSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h4 className="text-sm font-semibold text-zinc-200">{title}</h4>
        {subtitle && (
          <span
            className={`text-[10px] ${highlight === "red" ? "text-red-400" : "text-zinc-500"}`}
          >
            · {subtitle}
          </span>
        )}
        <span className="text-[10px] font-mono text-zinc-600 ml-auto">
          {count} ITEMS
        </span>
      </div>
      <ul className="space-y-2">
        {cases.map((t, i) => (
          <TestCaseItem
            key={t.id}
            index={i + 1}
            testCase={t}
            status={statuses[t.id] ?? "pending"}
            onChangeStatus={(s) => onChangeStatus(t.id, s)}
            highlight={highlight}
          />
        ))}
      </ul>
    </div>
  );
}

interface TestCaseItemProps {
  index: number;
  testCase: TestCase;
  status: CaseStatus;
  onChangeStatus: (status: CaseStatus) => void;
  highlight?: "red";
}

function TestCaseItem({
  index,
  testCase,
  status,
  onChangeStatus,
  highlight,
}: TestCaseItemProps) {
  const borderColor =
    status === "pass"
      ? "border-emerald-900/60"
      : status === "fail"
        ? "border-red-900/60"
        : status === "skip"
          ? "border-zinc-700"
          : highlight === "red"
            ? "border-red-900/30"
            : "border-zinc-800/80";

  const bg =
    status === "pass"
      ? "bg-emerald-950/20"
      : status === "fail"
        ? "bg-red-950/20"
        : "bg-zinc-950/40";

  return (
    <li className={`rounded-lg border ${borderColor} ${bg} p-3 transition-colors`}>
      <div className="flex gap-3 items-start">
        <span
          className="text-xs font-mono shrink-0 mt-0.5 w-12"
          style={{
            color: highlight === "red" ? "#f87171" : "rgba(52,211,153,0.6)",
          }}
        >
          TC-{String(index).padStart(2, "0")}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-200 leading-relaxed">{testCase.text}</p>

          {testCase.gwt && (
            <div className="mt-2 pt-2 border-t border-zinc-800/60 space-y-1 font-mono text-[11px]">
              <div className="flex gap-2">
                <span className="text-zinc-500 shrink-0 w-12">GIVEN</span>
                <span className="text-zinc-400">{testCase.gwt.given}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 shrink-0 w-12">WHEN</span>
                <span className="text-zinc-400">{testCase.gwt.when}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-zinc-500 shrink-0 w-12">THEN</span>
                <span className="text-zinc-300">{testCase.gwt.then}</span>
              </div>
            </div>
          )}
        </div>

        {/* Pass / Fail / Skip 버튼 */}
        <div className="flex gap-1 shrink-0">
          <StatusButton
            active={status === "pass"}
            onClick={() => onChangeStatus("pass")}
            color="emerald"
            icon={<Check className="w-3.5 h-3.5" />}
            label="Pass"
          />
          <StatusButton
            active={status === "fail"}
            onClick={() => onChangeStatus("fail")}
            color="red"
            icon={<X className="w-3.5 h-3.5" />}
            label="Fail"
          />
          <StatusButton
            active={status === "skip"}
            onClick={() => onChangeStatus("skip")}
            color="zinc"
            icon={<Minus className="w-3.5 h-3.5" />}
            label="Skip"
          />
        </div>
      </div>
    </li>
  );
}

interface StatusButtonProps {
  active: boolean;
  onClick: () => void;
  color: "emerald" | "red" | "zinc";
  icon: React.ReactNode;
  label: string;
}

function StatusButton({
  active,
  onClick,
  color,
  icon,
  label,
}: StatusButtonProps) {
  const colorMap = {
    emerald: {
      active: "bg-emerald-500/20 border-emerald-500/60 text-emerald-300",
      idle: "border-zinc-800 text-zinc-600 hover:border-emerald-700 hover:text-emerald-400",
    },
    red: {
      active: "bg-red-500/20 border-red-500/60 text-red-300",
      idle: "border-zinc-800 text-zinc-600 hover:border-red-700 hover:text-red-400",
    },
    zinc: {
      active: "bg-zinc-700/40 border-zinc-500 text-zinc-200",
      idle: "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400",
    },
  };

  const cls = active ? colorMap[color].active : colorMap[color].idle;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 rounded border text-[11px] font-mono transition-colors ${cls}`}
      aria-label={label}
      title={label}
    >
      {icon}
    </button>
  );
}