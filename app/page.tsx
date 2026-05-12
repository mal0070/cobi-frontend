'use client'
import CodeInputPanel from "@/components/CodeInputPanel";
import Footer from "@/components/common/Footer";
import Header from "@/components/common/Header";
import { IdleActions, IdleHero } from "@/components/views/IdleView";
import LoadingView from "@/components/views/LoadingView";
import ResultView, { Tab } from "@/components/views/ResultView";
import { analyze, AnalyzeError } from "@/lib/api";
import { SAMPLE_CODE } from "@/lib/mockData";
import type { AnalysisStatus, AnalyzeResponse, LanguageId, RoleId } from "@/types/api";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useState } from "react";

function getAnalysisCacheKey(req: { code: string; language: string; roles: RoleId[] }): string {
  return "cobi_analysis_" + JSON.stringify({ ...req, roles: [...req.roles].sort() });
}

function getCachedAnalysis(key: string): AnalyzeResponse | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AnalyzeResponse) : null;
  } catch {
    return null;
  }
}

function setCachedAnalysis(key: string, result: AnalyzeResponse): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(result));
  } catch {
    // 스토리지 초과 시 무시
  }
}

export default function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState<LanguageId>("auto");
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>(["pm", "designer", "qa", "cs"]);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [activeTab, setActiveTab] = useState<Tab>("flowchart");
  const [codeCollapsed, setCodeCollapsed] = useState(false);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedCode, setAnalyzedCode] = useState(SAMPLE_CODE);

  const handleAnalyze = async () => {
    if (!code.trim() || selectedRoles.length === 0) return;

    const req = {
      code,
      language: autoDetect ? "auto" : language,
      roles: selectedRoles,
      output_style: "detailed" as const,
    };

    const cacheKey = getAnalysisCacheKey(req);
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      setAnalyzedCode(code);
      setResponse(cached);
      setStatus("success");
      setActiveTab("flowchart");
      setCodeCollapsed(true);
      return;
    }

    setStatus("loading");
    setError(null);
    try {
      const res = await analyze(req);
      setCachedAnalysis(cacheKey, res);
      setAnalyzedCode(code);
      setResponse(res);
      setStatus("success");
      setActiveTab("flowchart");
      setCodeCollapsed(true);
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof AnalyzeError ? e.message :
        e instanceof Error ? e.message :
        "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  const handleReset = () => {
    setCode(analyzedCode);
    setStatus("idle");
    setResponse(null);
    setError(null);
    setCodeCollapsed(false);
  };

  const toggleRole = (id: RoleId) => {
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
          <ErrorState message={error ?? "알 수 없는 오류"} onRetry={handleReset} />
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

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="py-16">
      <div className="flex flex-col items-center justify-center gap-5 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-200 mb-2">분석에 실패했어요</p>
          <p className="text-xs text-zinc-500 font-mono break-all">{message}</p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 rounded-md border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900 text-sm text-zinc-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          다시 시도
        </button>
      </div>
    </section>
  );
}
