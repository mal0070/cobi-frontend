'use client'
import CodeInputPanel, { LANGUAGES, LanguageId } from "@/components/CodeInputPanel";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { IdleActions, IdleHero } from "@/components/views/IdleView";
import LoadingView from "@/components/views/LoadingView";
import ResultView, { Tab } from "@/components/views/ResultView";
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

type Status = "idle" | "loading" | "result";

export default function App() {
  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState<LanguageId>("javascript");
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["pm", "designer", "qa"]);
  const [status, setStatus] = useState<Status>("idle");
  const [activeTab, setActiveTab] = useState<Tab>("flowchart");
  const [codeCollapsed, setCodeCollapsed] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  const handleAnalyze = () => {
    if (!code.trim() || selectedRoles.length === 0) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("result");
      setActiveTab("flowchart");
      setCodeCollapsed(true);
    }, 1800);
  };

  const handleReset = () => {
    setStatus("idle");
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

        {status === "result" && (
          <ResultView
            selectedRoles={selectedRoles}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onReset={handleReset}
            currentLangLabel={currentLang.label}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
