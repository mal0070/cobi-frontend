'use client'
import ResultView, { Tab } from "@/components/views/ResultView";
import { loadLatestResult } from "@/lib/latestResult";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AnalyzeResponse } from "@/types/api";

export default function ResultPage() {
  const router = useRouter();
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("flowchart");

  useEffect(() => {
    const latest = loadLatestResult();
    if (!latest) {
      router.replace("/");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResponse(latest.response);
  }, [router]);

  if (!response) return null;

  return (
    <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-6 py-8 relative">
      <ResultView
        response={response}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onReset={() => router.push("/")}
      />
    </main>
  );
}
