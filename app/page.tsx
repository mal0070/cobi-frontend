'use client'
import CodeInputPanel, { LanguageId } from "@/components/CodeInputPanel";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { IdleActions, IdleHero } from "@/components/views/IdleView";
import LoadingView from "@/components/views/LoadingView";
import ResultView, { Tab } from "@/components/views/ResultView";
import { analyze, AnalyzeError } from "@/lib/api";
import type { AnalyzeResponse, RoleId } from "@/types/api";
import { useState } from "react";

const SAMPLE_CODE = `function processOrder(order) {
  if (!order.userId) {
    return { status: 'error', message: 'Login required' };
  }

  if (order.amount <= 0) {
    return { status: 'error', message: 'Invalid amount' };
  }

  if (order.amount > 1000000) {
    return { status: 'pending', message: 'Approval required' };
  }

  return { status: 'success', message: 'Order processed' };
}`;

type Status = "idle" | "loading" | "success" | "error";

export default function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["pm", "designer", "qa"]);
  const [status, setStatus] = useState<Status>("idle");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [codeCollapsed, setCodeCollapsed] = useState(false);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim() || selectedRoles.length === 0) return;
    setStatus("loading");
    setError(null);
    try {
      const res = await analyze({
        code,
        language: autoDetect ? "auto" : language,
        roles: selectedRoles as RoleId[],
        output_style: "detailed",
      });
      setResponse(res);
      setStatus("success");
      setActiveTab("overview");
      setCodeCollapsed(true);
    } catch (e) {
      setStatus("error");
      setError(e instanceof AnalyzeError ? e.message : "분석 중 오류가 발생했습니다.");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setResponse(null);
    setError(null);
    setCodeCollapsed(false);
  };

  const toggleRole = (id: string) => {
    setSelectedRoles((prev) => prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: '"Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif' }}>
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        {status === "idle" && <IdleHero />}

        <CodeInputPanel
          code={code}
          onCodeChange={setCode}
          language={language}
          onLanguageChange={setLanguage}
          autoDetect={autoDetect}
          onAutoDetectChange={setAutoDetect}
          status={status}
          codeCollapsed={codeCollapsed}
          onCollapsedChange={setCodeCollapsed}
        />

        {status === "idle" && (
          <IdleActions
            code={code}
            selectedRoles={selectedRoles}
            onToggleRole={toggleRole}
            onAnalyze={handleAnalyze}
          />
        )}

        {status === "loading" && <LoadingView />}

        {status === "error" && (
          <div className="mt-6 rounded-xl border border-red-900/60 bg-red-950/20 p-6 space-y-4">
            <p className="text-sm text-red-400 font-mono">{error}</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm hover:border-zinc-500 hover:text-white transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {status === "success" && response && (
          <ResultView
            response={response}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onReset={handleReset}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
