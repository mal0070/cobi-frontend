"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

interface CopyButtonProps {
  /** 복사할 텍스트 */
  text: string;
  /** 버튼 라벨 (생략 시 아이콘만) */
  label?: string;
  /** 버튼 사이즈 */
  size?: "sm" | "md";
  /** 액센트 컬러 (복사 성공 시 사용) */
  accent?: string;
  className?: string;
}

/**
 * 클립보드 복사 버튼
 *
 * 클릭 시 navigator.clipboard로 복사하고
 * 1.5초간 체크 아이콘 표시.
 */
export function CopyButton({
  text,
  label,
  size = "sm",
  accent,
  className = "",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1.5";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono transition-colors ${sizeClass} ${className}`}
      style={copied && accent ? { color: accent, borderColor: accent + "60" } : undefined}
      aria-label={copied ? "복사됨" : "복사"}
    >
      {copied ? (
        <>
          <Check className={iconSize} />
          {label && <span>복사됨</span>}
        </>
      ) : (
        <>
          <Copy className={iconSize} />
          {label && <span>{label}</span>}
        </>
      )}
    </button>
  );
}