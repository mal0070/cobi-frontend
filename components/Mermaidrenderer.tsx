"use client";

import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";

interface MermaidRendererProps {
  /** Mermaid 원본 코드 */
  code: string;
  /** 렌더링 캐시 무효화용 키 */
  id?: string;
}

let initialized = false;

/**
 * Mermaid 다이어그램 렌더러
 *
 * 백엔드가 보낸 Mermaid 코드를 SVG로 렌더링합니다.
 * mermaid는 클라이언트 전용이므로 "use client" 필수.
 *
 * 설치: npm install mermaid
 */
export function MermaidRenderer({ code, id = "diagram" }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string>("");

  // 최초 1회 mermaid 초기화 (다크 테마)
  useEffect(() => {
    if (initialized) return;
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "JetBrains Mono, ui-monospace, monospace",
      themeVariables: {
        background: "#0a0a0a",
        primaryColor: "#1c1917",
        primaryTextColor: "#fafafa",
        primaryBorderColor: "#71717a",
        lineColor: "#52525b",
        fontSize: "13px",
      },
    });
    initialized = true;
  }, []);

  // 코드가 바뀔 때마다 다시 렌더링
  useEffect(() => {
    let cancelled = false;

    const render = async () => {
      try {
        setError(null);
        // mermaid.render는 unique ID를 요구함
        const renderId = `mermaid-${id}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, code);
        if (!cancelled) setSvg(svg);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "다이어그램 렌더링에 실패했습니다");
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (error) {
    return (
      <div className="rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-400 font-mono">
        <p className="font-medium mb-2">⚠ 다이어그램 렌더링 오류</p>
        <pre className="text-xs opacity-80 whitespace-pre-wrap">{error}</pre>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-container w-full flex items-center justify-center [&_svg]:w-auto [&_svg]:h-auto"
      // 위험: mermaid가 생성한 SVG 마크업을 그대로 삽입
      // mermaid는 신뢰 가능한 라이브러리지만, 보안 정책상 dangerouslySetInnerHTML 사용을 알리는 주석
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}