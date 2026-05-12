'use client';

import { Check, MessageSquare } from 'lucide-react';
import { useState } from 'react';

type Variant = 'default' | 'highlight';

interface IssueCommentButtonProps {
  /** 복사할 마크다운 텍스트 */
  text: string;
  /** highlight: 빨간 톤으로 강조 (불일치 등 시급 액션) */
  variant?: Variant;
  /** 라벨 (기본: "이슈 만들기") */
  label?: string;
  className?: string;
}

/**
 * 이슈 코멘트 복사 버튼
 *
 * 일반 복사 버튼과 구분하기 위해:
 * - 💬 메시지 아이콘 + 명시적 라벨 ("이슈 만들기")
 * - variant="highlight"로 시급도 표현 가능
 * - 복사 후 "✓ 복사됨 · N줄" 형태로 무엇이 복사됐는지 힌트
 *
 * 용도:
 * - 슬랙/지라 코멘트에 바로 붙여넣을 마크다운 복사
 * - 단순 텍스트 한 줄 복사와 명확히 구분되어야 하는 경우
 */
export function IssueCommentButton({
  text,
  variant = 'default',
  label = '이슈 만들기',
  className = '',
}: IssueCommentButtonProps) {
  const [copied, setCopied] = useState(false);

  const lineCount = text.split('\n').length;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('복사 실패:', err);
    }
  };

  // 변형별 스타일
  const variantClass =
    variant === 'highlight'
      ? // 불일치 등 시급 액션 - 빨간 톤 강조
        'border-red-500/50 bg-red-500/10 text-red-300 hover:bg-red-500/20 hover:border-red-500/70'
      : // 기본 - 파란 톤 (PM accent)
        'border-blue-500/30 bg-blue-500/5 text-blue-300 hover:bg-blue-500/15 hover:border-blue-500/50';

  // 복사 직후 - 어떤 variant든 성공 톤(에메랄드)으로 명확한 피드백
  const copiedClass =
    'border-emerald-500/60 bg-emerald-500/15 text-emerald-300';

  return (
    <button
      onClick={handleCopy}
      className={`group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-all whitespace-nowrap ${
        copied ? copiedClass : variantClass
      } ${className}`}
      aria-label={copied ? '이슈 코멘트 복사됨' : '이슈 코멘트 복사'}
      title={copied ? '복사되었습니다' : '슬랙/지라용 마크다운 복사'}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>복사됨 · {lineCount}줄</span>
        </>
      ) : (
        <>
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
