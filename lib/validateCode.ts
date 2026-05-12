import type { LanguageId } from "@/types/api";

// 문자열 리터럴과 블록/라인 주석을 제거해 괄호만 남김
function stripStringsAndComments(code: string): string {
  let out = "";
  let i = 0;
  const n = code.length;

  while (i < n) {
    // 트리플 쿼트 (Python docstring, JS multiline string)
    if (
      (code[i] === '"' || code[i] === "'") &&
      code[i + 1] === code[i] &&
      code[i + 2] === code[i]
    ) {
      const q = code[i].repeat(3);
      i += 3;
      const end = code.indexOf(q, i);
      i = end === -1 ? n : end + 3;
      continue;
    }

    // 블록 주석 /* */
    if (code[i] === "/" && code[i + 1] === "*") {
      i += 2;
      const end = code.indexOf("*/", i);
      i = end === -1 ? n : end + 2;
      continue;
    }

    // 라인 주석 //
    if (code[i] === "/" && code[i + 1] === "/") {
      while (i < n && code[i] !== "\n") i++;
      continue;
    }

    // 문자열 리터럴 " ' `
    if (code[i] === '"' || code[i] === "'" || code[i] === "`") {
      const q = code[i++];
      while (i < n && code[i] !== q) {
        if (code[i] === "\\") i++; // 이스케이프 문자 건너뜀
        i++;
      }
      i++;
      continue;
    }

    out += code[i++];
  }

  return out;
}

function checkBracketBalance(code: string): boolean {
  const stripped = stripStringsAndComments(code);
  const stack: string[] = [];
  const closing: Record<string, string> = { ")": "(", "}": "{", "]": "[" };

  for (const ch of stripped) {
    if ("([{".includes(ch)) {
      stack.push(ch);
    } else if (")]}".includes(ch)) {
      if (stack.length === 0 || stack[stack.length - 1] !== closing[ch])
        return false;
      stack.pop();
    }
  }

  return stack.length === 0;
}

function checkPythonIndent(code: string): boolean {
  const nonEmpty = code
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"));

  // 탭과 스페이스 혼용 검사
  for (const line of nonEmpty) {
    const indent = line.match(/^(\s+)/)?.[1] ?? "";
    if (indent.includes("\t") && indent.includes(" ")) return false;
  }

  // 제어 흐름 키워드 ':'로 끝나는 줄 다음은 반드시 들여쓰기 증가
  const controlFlow =
    /^\s*(if|elif|else|for|while|def|class|with|try|except|finally)\b.*:\s*$/;

  for (let i = 0; i < nonEmpty.length - 1; i++) {
    if (controlFlow.test(nonEmpty[i])) {
      const cur = (nonEmpty[i].match(/^(\s*)/)?.[1] ?? "").length;
      const next = (nonEmpty[i + 1].match(/^(\s*)/)?.[1] ?? "").length;
      if (next <= cur) return false;
    }
  }

  return true;
}

export function validateCode(
  code: string,
  language: LanguageId | null
): string | null {
  if (!checkBracketBalance(code)) return "잘못된 입력입니다";
  if (language === "python" && !checkPythonIndent(code))
    return "잘못된 입력입니다";
  return null;
}
