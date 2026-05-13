'use client';
import CodeInputPanel from '@/components/CodeInputPanel';
import { IdleActions, IdleHero } from '@/components/views/IdleView';
import LoadingView from '@/components/views/LoadingView';
import { analyze, AnalyzeError } from '@/lib/api';
import { detectLanguage } from '@/lib/detectLanguage';
import { loadLatestResult, saveLatestResult } from '@/lib/latestResult';
import { validateCode } from '@/lib/validateCode';
import type {
  AnalysisStatus,
  AnalyzeResponse,
  LanguageId,
  RoleId,
} from '@/types/api';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function getAnalysisCacheKey(req: {
  code: string;
  language: string;
  roles: RoleId[];
}): string {
  return (
    'cobi_analysis_' + JSON.stringify({ ...req, roles: [...req.roles].sort() })
  );
}

function getCachedAnalysis(key: string): AnalyzeResponse | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as AnalyzeResponse) : null;
  } catch {
    return null;
  }
}

function collectCachedViews(req: { code: string; language: string }): {
  base: AnalyzeResponse | null;
  roleViews: AnalyzeResponse['role_views'];
} {
  const roleViews: AnalyzeResponse['role_views'] = {};
  let base: AnalyzeResponse | null = null;
  try {
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (!key?.startsWith('cobi_analysis_')) continue;
      const cachedReq = JSON.parse(key.slice('cobi_analysis_'.length)) as {
        code: string;
        language: string;
      };
      if (cachedReq.code !== req.code || cachedReq.language !== req.language)
        continue;
      const raw = sessionStorage.getItem(key);
      if (!raw) continue;
      const response = JSON.parse(raw) as AnalyzeResponse;
      if (!base) base = response;
      Object.assign(roleViews, response.role_views);
    }
  } catch {}
  return { base, roleViews };
}

function setCachedAnalysis(key: string, result: AnalyzeResponse): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(result));
  } catch {}
}

export default function HomePage() {
  const router = useRouter();

  const [code, setCode] = useState('');

  useEffect(() => {
    const stored = loadLatestResult()?.code;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setCode(stored);
  }, []);
  const [language, setLanguage] = useState<LanguageId>('auto');
  const [autoDetect, setAutoDetect] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<RoleId[]>([
    'pm',
    'designer',
    'qa',
    'cs',
  ]);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (!inputError) return;
    const t = setTimeout(() => setInputError(null), 3000);
    return () => clearTimeout(t);
  }, [inputError]);

  const handleAnalyze = async () => {
    if (!code.trim()) return;

    if (selectedRoles.length === 0) {
      setInputError('직군을 선택해주세요');
      return;
    }

    const effectiveLang = autoDetect ? detectLanguage(code) : language;
    const validationErr = validateCode(code, effectiveLang);
    if (validationErr) {
      setInputError(validationErr);
      return;
    }

    const req = {
      code,
      language: autoDetect ? 'auto' : language,
      roles: selectedRoles,
      output_style: 'detailed' as const,
    };

    const navigateWithResult = (response: AnalyzeResponse) => {
      saveLatestResult({ response, code });
      router.push('/result');
    };

    const cacheKey = getAnalysisCacheKey(req);
    const exactHit = getCachedAnalysis(cacheKey);
    if (exactHit) {
      navigateWithResult(exactHit);
      return;
    }

    const { base, roleViews: cachedViews } = collectCachedViews(req);
    const uncovered = req.roles.filter((r) => !cachedViews[r]);

    if (uncovered.length === 0 && base) {
      const merged = {
        ...base,
        role_views: Object.fromEntries(
          req.roles.map((r) => [r, cachedViews[r]]),
        ) as AnalyzeResponse['role_views'],
      };
      setCachedAnalysis(cacheKey, merged);
      navigateWithResult(merged);
      return;
    }

    setStatus('loading');
    setError(null);
    try {
      const res = await analyze({
        ...req,
        roles: uncovered.length > 0 ? uncovered : req.roles,
      });
      const mergedRoleViews = {
        ...cachedViews,
        ...res.role_views,
      };
      const finalResponse = {
        ...res,
        role_views: Object.fromEntries(
          req.roles.map((r) => [r, mergedRoleViews[r]]),
        ) as AnalyzeResponse['role_views'],
      };
      setCachedAnalysis(cacheKey, finalResponse);
      navigateWithResult(finalResponse);
    } catch (e) {
      setStatus('error');
      setError(
        e instanceof AnalyzeError
          ? e.message
          : e instanceof Error
            ? e.message
            : '알 수 없는 오류가 발생했습니다.',
      );
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
  };

  const toggleRole = (id: RoleId) => {
    setSelectedRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  return (
    <main className="max-w-7xl mx-auto py-8 relative">
      <div className="w-4xl">
        {status === 'idle' && <IdleHero />}

        <CodeInputPanel
          code={code}
          onCodeChange={setCode}
          language={language}
          onLanguageChange={setLanguage}
          autoDetect={autoDetect}
          onAutoDetectChange={setAutoDetect}
          status={status}
          codeCollapsed={false}
          onCollapsedChange={() => {}}
          onClear={() => setCode('')}
        />

        {inputError && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-4 rounded-lg border border-red-900/60 bg-red-950/30 text-sm text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            {inputError}
          </div>
        )}

        {status === 'idle' && (
          <IdleActions
            code={code}
            selectedRoles={selectedRoles}
            onToggleRole={toggleRole}
            onAnalyze={handleAnalyze}
          />
        )}

        {status === 'loading' && <LoadingView />}

        {status === 'error' && (
          <ErrorState
            message={error ?? '알 수 없는 오류'}
            onRetry={handleRetry}
          />
        )}
      </div>
    </main>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="py-16">
      <div className="flex flex-col items-center justify-center gap-5 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-950/40 border border-red-900/60 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-200 mb-2">
            분석에 실패했어요
          </p>
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
