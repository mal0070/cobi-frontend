"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

const STEPS = [
  "코드를 파싱하는 중...",
  "Logic IR을 생성하는 중...",
  "다이어그램을 만드는 중...",
  "직군별 설명을 작성하는 중...",
  "조금만 더 기다려주세요...",
];

export default function LoadingView() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-16">
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border border-zinc-800" />
          <Loader2
            className="w-14 h-14 absolute inset-0 animate-spin text-zinc-300"
            strokeWidth={1.5}
          />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-200 mb-1">{STEPS[stepIndex]}</p>
          <p className="text-xs text-zinc-500 font-mono">AI 분석은 보통 10–20초가 걸려요</p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
