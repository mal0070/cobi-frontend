"use client";

import { MermaidRenderer } from "@/components/Mermaidrenderer";
import { RoleView } from "@/components/views/RoleView";
import type { AnalyzeResponse, RoleId } from "@/types/api";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileCode,
  GitBranch,
  Headphones,
  Palette,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import React, { useState } from "react";

export type Tab = "flowchart" | "state" | "pm" | "designer" | "qa" | "cs";

const ROLE_META: Record<RoleId, { label: string; icon: React.ComponentType<{ className?: string }>; accent: string }> = {
  pm:       { label: "PM",       icon: BarChart3,      accent: "rgb(96 165 250)"  },
  designer: { label: "Designer", icon: Palette,        accent: "rgb(244 114 182)" },
  qa:       { label: "QA",       icon: ClipboardCheck, accent: "rgb(52 211 153)"  },
  cs:       { label: "CS",       icon: Headphones,     accent: "rgb(251 146 60)"  },
};

interface ResultViewProps {
  response: AnalyzeResponse;
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  onReset: () => void;
}

export default function ResultView({ response, activeTab, onTabChange, onReset }: ResultViewProps) {
  const [warningsCollapsed, setWarningsCollapsed] = useState(false);
  const { logic_ir, visualizations, role_views, detected_language, confidence, warnings } = response;
  const confidenceInfo = getConfidenceInfo(confidence);
  const availableRoles = Object.keys(role_views) as RoleId[];

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: "flowchart", label: "Flowchart",     icon: GitBranch, color: "#fafafa" },
    { id: "state",     label: "State Diagram", icon: Activity,  color: "#fafafa" },
    ...availableRoles.map((role) => {
      const meta = ROLE_META[role];
      return { id: role as Tab, label: `${meta.label} View`, icon: meta.icon, color: meta.accent };
    }),
  ];

  return (
    <section className="space-y-5">
      {/* 메타 칩 + 리셋 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Chip>
            <FileCode className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">lang</span>
            <span className="text-zinc-200">{detected_language}</span>
          </Chip>
          <Chip>
            <GitBranch className="w-3 h-3 text-zinc-500" />
            <span className="text-zinc-500">branches</span>
            <span className="text-zinc-200">{logic_ir.branches.length}</span>
          </Chip>
          <Chip>
            <span className="text-zinc-500">inputs</span>
            <span className="text-zinc-200">{logic_ir.inputs.length}</span>
          </Chip>
          <div className={`px-3 py-1.5 rounded-md border text-xs font-mono flex items-center gap-1.5 ${confidenceInfo.bg}`}>
            <confidenceInfo.Icon className={`w-3.5 h-3.5 ${confidenceInfo.color}`} />
            <span className={confidenceInfo.color}>
              confidence: {(confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-xs text-zinc-400 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          새로 분석
        </button>
      </div>

      {/* 경고 패널 (접이식) */}
      {warnings.length > 0 && !warningsCollapsed && (
        <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-amber-900/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-200">
                분석 경고 {warnings.length}건
              </span>
            </div>
            <button
              onClick={() => setWarningsCollapsed(true)}
              className="p-1 rounded hover:bg-amber-900/30 transition-colors"
              aria-label="경고 닫기"
            >
              <X className="w-3.5 h-3.5 text-amber-400/70" />
            </button>
          </div>
          <ul className="p-3 space-y-1">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-200/90 flex gap-2 px-1">
                <span className="text-amber-500/70 shrink-0">·</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 탭 바 */}
      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            icon={tab.icon}
            color={tab.color}
          >
            {tab.label}
          </TabButton>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 min-h-[500px]">
        {activeTab === "flowchart" && (
          <DiagramPanel
            title={visualizations.flowchart.title}
            mermaid={visualizations.flowchart.mermaid}
            id="flowchart"
          />
        )}

        {activeTab === "state" && (
          <DiagramPanel
            title={visualizations.state_diagram.title}
            mermaid={visualizations.state_diagram.mermaid}
            id="state"
          />
        )}

        {availableRoles.map((role) =>
          activeTab === role && role_views[role] ? (
            <RoleView key={role} data={role_views[role]!} role={role} />
          ) : null
        )}
      </div>
    </section>
  );
}

// ============================================================
// 헬퍼 컴포넌트
// ============================================================

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono flex items-center gap-1.5">
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  color,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        active ? "text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
      style={active ? { color, borderColor: color } : undefined}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function DiagramPanel({ title, mermaid, id }: { title: string; mermaid: string; id: string }) {
  return (
    <div>
      <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-4">{title}</p>
      <div className="bg-zinc-950/60 rounded-lg p-6 border border-zinc-800/60 min-h-[400px] flex items-center justify-center">
        <MermaidRenderer code={mermaid} id={id} />
      </div>
    </div>
  );
}

function getConfidenceInfo(confidence: number) {
  if (confidence >= 0.85) {
    return { Icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-900/60" };
  }
  if (confidence >= 0.65) {
    return { Icon: Shield,      color: "text-amber-400",   bg: "bg-amber-950/40 border-amber-900/60"   };
  }
  return     { Icon: ShieldAlert, color: "text-red-400",   bg: "bg-red-950/40 border-red-900/60"       };
}
