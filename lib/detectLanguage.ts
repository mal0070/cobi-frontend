import type { LanguageId } from "@/types/api";

/**
 * 키워드 휴리스틱 기반 언어 감지
 *
 * 각 언어의 시그니처 패턴을 가중치와 함께 매칭하여 점수를 매기고
 * 가장 높은 점수의 언어를 반환합니다.
 *
 * 한계:
 * - 매우 짧은 코드(< 5자)는 감지하지 않음 (null 반환)
 * - 모든 언어에서 valid한 코드는 1위 점수가 낮을 수 있음
 * - 100% 정확하지 않으므로 사용자가 override할 수 있어야 함
 */

interface Pattern {
  regex: RegExp;
  score: number;
}

const PATTERNS: Record<LanguageId, Pattern[]> = {
  // -- JavaScript --
  javascript: [
    { regex: /\bfunction\s+\w+\s*\(/g, score: 3 },
    { regex: /=>\s*[{(]/g, score: 3 },
    { regex: /\bconsole\.log/g, score: 6 },
    { regex: /\brequire\s*\(/g, score: 5 },
    { regex: /\bmodule\.exports/g, score: 6 },
    { regex: /===|!==/g, score: 2 },
    { regex: /\b(let|const|var)\s+\w+/g, score: 2 },
    { regex: /\.then\s*\(|\.catch\s*\(/g, score: 4 },
    { regex: /\basync\s+function|\bawait\s+/g, score: 4 },
    { regex: /\breturn\s+\{/g, score: 1 },
  ],

  // -- TypeScript (JS의 superset이므로 추가 시그니처가 핵심) --
  typescript: [
    { regex: /:\s*(string|number|boolean|void|any|unknown|never)\b/g, score: 6 },
    { regex: /\binterface\s+[A-Z]\w*/g, score: 7 },
    { regex: /\btype\s+[A-Z]\w*\s*=/g, score: 6 },
    { regex: /\benum\s+[A-Z]\w*/g, score: 6 },
    { regex: /\breadonly\s+\w+/g, score: 5 },
    { regex: /<[A-Z]\w*(\[\])?>/g, score: 2 },
    { regex: /\bas\s+(string|number|boolean|\w+\[\])/g, score: 4 },
    { regex: /\bimplements\s+\w+/g, score: 4 },
    // JS 패턴도 약하게 포함 (TS는 JS의 superset)
    { regex: /\b(let|const|var)\s+\w+/g, score: 1 },
    { regex: /=>\s*[{(]/g, score: 2 },
    { regex: /\bconsole\.log/g, score: 2 },
  ],

  // -- Python --
  python: [
    { regex: /^\s*def\s+\w+\s*\([^)]*\)\s*(?:->\s*\w+\s*)?:/gm, score: 8 },
    { regex: /^\s*elif\s+/gm, score: 7 },
    { regex: /\b__(init|name|main|str|repr)__\b/g, score: 8 },
    { regex: /\bself\b/g, score: 3 },
    { regex: /^\s*(import|from)\s+\w+/gm, score: 3 },
    { regex: /\bprint\s*\(/g, score: 2 },
    { regex: /\b(True|False|None)\b/g, score: 2 },
    { regex: /^\s*class\s+\w+\s*(\(\w+\))?\s*:/gm, score: 6 },
    { regex: /^\s*@\w+\s*$/gm, score: 3 },
  ],

  // -- Java --
  java: [
    { regex: /\bpublic\s+static\s+void\s+main\s*\(/g, score: 12 },
    { regex: /\bSystem\.out\.print(ln)?/g, score: 9 },
    { regex: /\b(public|private|protected)\s+(static\s+)?(final\s+)?(void|class|int|String|boolean)\b/g, score: 5 },
    { regex: /@Override|@Deprecated|@SuppressWarnings/g, score: 6 },
    { regex: /\b(extends|implements)\s+[A-Z]\w*/g, score: 4 },
    { regex: /\bnew\s+[A-Z]\w*\s*\(/g, score: 2 },
    { regex: /\bthrows\s+\w+Exception/g, score: 5 },
    { regex: /\bSystem\.exit\s*\(/g, score: 6 },
  ],

  // -- Go --
  go: [
    { regex: /^package\s+\w+/gm, score: 12 },
    { regex: /^import\s+\(/gm, score: 7 },
    { regex: /\bfunc\s+(\(\w+\s+\*?\w+\)\s+)?\w+\s*\(/g, score: 6 },
    { regex: /:=/g, score: 4 },
    { regex: /\bfmt\.\w+/g, score: 8 },
    { regex: /\binterface\s*\{/g, score: 4 },
    { regex: /\bgo\s+\w+\s*\(/g, score: 7 },
    { regex: /\bchan\s+\w+/g, score: 7 },
    { regex: /\b(nil|iota)\b/g, score: 3 },
    { regex: /\berr\s*!=\s*nil/g, score: 6 },
  ],

  // -- Rust --
  rust: [
    { regex: /\bfn\s+\w+\s*[<(]/g, score: 5 },
    { regex: /\blet\s+mut\b/g, score: 8 },
    { regex: /&str\b|&mut\b/g, score: 6 },
    { regex: /\bString::from|::new\(\)/g, score: 6 },
    { regex: /\bimpl(\s+\w+)?\s+(for\s+)?\w+/g, score: 7 },
    { regex: /\bpub\s+(fn|struct|enum|mod)\b/g, score: 7 },
    { regex: /->\s*[A-Z]\w*/g, score: 3 },
    { regex: /\b(Some|None|Ok|Err|Result|Option)\b/g, score: 4 },
    { regex: /\bmatch\s+\w+\s*\{/g, score: 5 },
    { regex: /\.unwrap\s*\(\s*\)/g, score: 6 },
    { regex: /\b(use|crate|mod)\s+\w+/g, score: 3 },
  ],

  // -- C# --
  csharp: [
    { regex: /\busing\s+System(\.\w+)*\s*;/g, score: 10 },
    { regex: /\bConsole\.(WriteLine|Write|ReadLine)/g, score: 10 },
    { regex: /\bnamespace\s+[A-Z]\w*/g, score: 7 },
    { regex: /\b(public|private|protected|internal)\s+(static\s+)?(void|class|int|string)\b/g, score: 5 },
    { regex: /\b(get|set)\s*;/g, score: 6 },
    { regex: /\bvar\s+\w+\s*=/g, score: 1 },
    { regex: /\bstring\[\]\s+args/g, score: 7 },
    { regex: /\bnew\s+List<\w+>/g, score: 5 },
  ],

  // -- Ruby --
  ruby: [
    { regex: /\battr_(accessor|reader|writer)\b/g, score: 10 },
    { regex: /\bdo\s*\|[\w,\s]*\|/g, score: 8 },
    { regex: /\bputs\s+/g, score: 6 },
    { regex: /\bdef\s+\w+(\s*\([^)]*\))?\s*$/gm, score: 5 },
    { regex: /^\s*end\s*$/gm, score: 3 },
    { regex: /\brequire\s+['"]/g, score: 4 },
    { regex: /\b(nil|elsif)\b/g, score: 4 },
    { regex: /@@?\w+/g, score: 3 },
    { regex: /=>\s*['"]/g, score: 2 },
  ],

  // -- Kotlin --
  kotlin: [
    { regex: /\bdata\s+class\s+\w+/g, score: 10 },
    { regex: /\bcompanion\s+object\b/g, score: 10 },
    { regex: /\boverride\s+fun\b/g, score: 8 },
    { regex: /\bfun\s+\w+\s*\(/g, score: 4 },
    { regex: /\bval\s+\w+\s*[:=]/g, score: 4 },
    { regex: /\b(suspend|coroutine|Flow)\b/g, score: 8 },
    { regex: /\?:\s+\w+/g, score: 6 }, // Elvis operator
    { regex: /\bprintln\s*\(/g, score: 3 },
    { regex: /\bwhen\s*\([^)]*\)\s*\{/g, score: 7 },
    { regex: /\bobject\s+[A-Z]\w*\s*\{/g, score: 6 },
  ],

  // -- PHP --
  php: [
    { regex: /<\?php/g, score: 20 },
    { regex: /\?>/g, score: 5 },
    { regex: /\$_(GET|POST|SESSION|SERVER|REQUEST|COOKIE)\b/g, score: 10 },
    { regex: /\$\w+/g, score: 1 },
    { regex: /->\s*\w+/g, score: 1 },
    { regex: /\becho\s+/g, score: 4 },
    { regex: /\bfunction\s+\w+\s*\(/g, score: 1 },
    { regex: /\bnamespace\s+\w+\\?\w*/g, score: 7 },
    { regex: /\buse\s+\w+\\\w+/g, score: 6 },
  ],
};

/**
 * 코드를 분석해 가장 가능성 높은 언어를 반환합니다.
 * 신뢰도가 낮으면 null을 반환합니다.
 */
export function detectLanguage(code: string): LanguageId | null {
  const trimmed = code.trim();
  if (trimmed.length < 5) return null;

  const scores: Record<string, number> = {};

  for (const [lang, patterns] of Object.entries(PATTERNS)) {
    let score = 0;
    for (const { regex, score: weight } of patterns) {
      // 매번 새 RegExp을 만들지 않으려면 lastIndex를 리셋
      regex.lastIndex = 0;
      const matches = trimmed.match(regex);
      if (matches) score += matches.length * weight;
    }
    scores[lang] = score;
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);

  // 1위가 0점이면 어떤 패턴도 매칭되지 않은 것 — 감지 실패
  if (sorted[0][1] === 0) return null;

  // 1위가 너무 낮으면(예: 짧은 코드 + 모호한 키워드) 감지 실패로 처리
  if (sorted[0][1] < 3) return null;

  return sorted[0][0] as LanguageId;
}