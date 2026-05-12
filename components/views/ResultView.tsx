import { MermaidRenderer } from "@/components/Mermaidrenderer";
import { LogicIROverview } from "@/components/views/LogicIROverview";
import { RoleView } from "@/components/views/RoleView";
import type { AnalyzeResponse, RoleId } from "@/types/api";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  GitBranch,
  Headphones,
  Layers,
  Palette,
  RefreshCw,
} from "lucide-react";
import React from "react";

export type Tab = "overview" | "flowchart" | "state" | "pm" | "designer" | "qa" | "cs";

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
  const { logic_ir, visualizations, role_views, detected_language, confidence, warnings } = response;

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: "overview",  label: "Overview",     icon: Layers,    color: "#fafafa" },
    { id: "flowchart", label: "Flowchart",     icon: GitBranch, color: "#fafafa" },
    { id: "state",     label: "State Diagram", icon: Activity,  color: "#fafafa" },
    ...(Object.keys(role_views) as RoleId[]).map((role) => {
      const meta = ROLE_META[role];
      return { id: role as Tab, label: `${meta.label} View`, icon: meta.icon, color: meta.accent };
    }),
  ];

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="text-zinc-500">lang </span>
          <span className="text-zinc-200">{detected_language}</span>
        </div>
        <div className="px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-xs font-mono">
          <span className="text-zinc-500">branches </span>
          <span className="text-zinc-200">{logic_ir.branches.length}</span>
        </div>
        <div className="px-3 py-1.5 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-xs font-mono text-emerald-400">
          confidence: {Math.round(confidence * 100)}%
        </div>
        {warnings.length > 0 && (
          <div className="px-3 py-1.5 rounded-md bg-amber-950/40 border border-amber-900/60 text-xs font-mono text-amber-400">
            ⚠ {warnings.length} warning{warnings.length > 1 ? "s" : ""}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                active ? "border-current text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
              style={active ? { color: tab.color, borderColor: tab.color } : undefined}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 min-h-[500px]">
        {activeTab === "overview" && (
          <LogicIROverview data={logic_ir} />
        )}

        {activeTab === "flowchart" && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-4">
              {visualizations.flowchart.title}
            </p>
            <div className="bg-zinc-950/60 rounded-lg p-6 border border-zinc-800/60">
              <MermaidRenderer code={visualizations.flowchart.mermaid} id="flowchart" />
            </div>
          </div>
        )}

        {activeTab === "state" && (
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-4">
              {visualizations.state_diagram.title}
            </p>
            <div className="bg-zinc-950/60 rounded-lg p-6 border border-zinc-800/60">
              <MermaidRenderer code={visualizations.state_diagram.mermaid} id="state" />
            </div>
          </div>
        )}

        {(["pm", "designer", "qa", "cs"] as RoleId[]).map((role) => {
          const view = role_views[role];
          if (!view || activeTab !== role) return null;
          return <RoleView key={role} data={view} role={role} />;
        })}
      </div>

      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <div key={i} className="px-3 py-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-xs text-amber-400 font-mono">
              ⚠ {w}
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-4 rounded-xl border border-zinc-700 text-zinc-200 font-medium text-sm hover:border-zinc-500 hover:bg-zinc-900 hover:text-white transition-all flex items-center justify-center gap-2 group"
      >
        <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        새로 분석하기
      </button>
    </section>
  );
}
