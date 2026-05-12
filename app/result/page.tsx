'use client';
import CodeInputPanel from '@/components/CodeInputPanel';
import ResultView, { Tab } from '@/components/views/ResultView';
import { loadLatestResult } from '@/lib/latestResult';
import type { AnalyzeResponse, LanguageId } from '@/types/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const router = useRouter();
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('flowchart');
  const [codeCollapsed, setCodeCollapsed] = useState(true);

  useEffect(() => {
    const latest = loadLatestResult();
    if (!latest) {
      router.replace('/');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResponse(latest.response);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(latest.code);
  }, [router]);

  if (!response) return null;

  return (
    <main className="max-w-7xl mx-auto px-6 py-8 relative">
      <div className="w-4xl">
        <CodeInputPanel
          code={code}
          onCodeChange={() => {}}
          language={response.detected_language as LanguageId}
          onLanguageChange={() => {}}
          autoDetect={false}
          onAutoDetectChange={() => {}}
          status="success"
          codeCollapsed={codeCollapsed}
          onCollapsedChange={setCodeCollapsed}
        />
        <ResultView
          response={response}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onReset={() => router.push('/')}
        />
      </div>
    </main>
  );
}
