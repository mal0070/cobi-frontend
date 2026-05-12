'use client'

import { detectLanguage } from "@/lib/detectLanguage";
import type { LanguageId } from "@/types/api";
import { Check, ChevronDown, Code2, Wand2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const LANGUAGES = [
  { id: "javascript" as const, label: "JavaScript", ext: "js",   filename: "code"    },
  { id: "typescript" as const, label: "TypeScript", ext: "ts",   filename: "code"    },
  { id: "python"     as const, label: "Python",     ext: "py",   filename: "main"    },
  { id: "java"       as const, label: "Java",       ext: "java", filename: "Main"    },
  { id: "go"         as const, label: "Go",         ext: "go",   filename: "main"    },
  { id: "rust"       as const, label: "Rust",       ext: "rs",   filename: "main"    },
  { id: "csharp"     as const, label: "C#",         ext: "cs",   filename: "Program" },
  { id: "ruby"       as const, label: "Ruby",       ext: "rb",   filename: "main"    },
  { id: "kotlin"     as const, label: "Kotlin",     ext: "kt",   filename: "Main"    },
  { id: "php"        as const, label: "PHP",        ext: "php",  filename: "index"   },
] as const;

type Status = "idle" | "loading" | "success" | "error";

interface CodeInputPanelProps {
  code: string;
  onCodeChange: (code: string) => void;
  language: LanguageId;
  onLanguageChange: (lang: LanguageId) => void;
  autoDetect: boolean;
  onAutoDetectChange: (autoDetect: boolean) => void;
  status: Status;
  codeCollapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export default function CodeInputPanel({
  code,
  onCodeChange,
  language,
  onLanguageChange,
  autoDetect,
  onAutoDetectChange,
  status,
  codeCollapsed,
  onCollapsedChange,
}: CodeInputPanelProps) {
  const [langOpen, setLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    language === "auto"
      ? { label: "Auto", ext: "js", filename: "code" }
      : LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  useEffect(() => {
    if (!langOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langOpen]);

  useEffect(() => {
    if (!autoDetect) return;
    const handler = setTimeout(() => {
      const detected = detectLanguage(code);
      const next: LanguageId = detected ?? "auto";
      if (next !== language) onLanguageChange(next);
    }, 300);
    return () => clearTimeout(handler);
  }, [code, autoDetect, language, onLanguageChange]);

  return (
    <section className="mb-6 shrink-0">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
        <div className="w-full flex items-center justify-between px-4 py-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-medium text-zinc-300">
              {currentLang.filename}.{currentLang.ext}
            </span>

            <div ref={langDropdownRef} className="relative ml-1">
              <button
                onClick={() => setLangOpen((v) => !v)}
                disabled={status === "loading"}
                className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                aria-haspopup="listbox"
                aria-expanded={langOpen}
              >
                {currentLang.label}
                {autoDetect && (
                  <span className="flex items-center gap-0.5 px-1 py-[1px] rounded bg-emerald-950/60 border border-emerald-900/60 text-emerald-400 text-[9px]">
                    <Wand2 className="w-2.5 h-2.5" />
                    AUTO
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>
              {langOpen && (
                <div
                  role="listbox"
                  className="absolute top-full left-0 mt-1.5 w-52 rounded-lg border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50 z-20 overflow-hidden"
                >
                  <button
                    role="option"
                    aria-selected={autoDetect}
                    onClick={() => {
                      onAutoDetectChange(true);
                      const detected = detectLanguage(code);
                      onLanguageChange(detected ?? "auto");
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors border-b border-zinc-800 ${
                      autoDetect
                        ? "bg-emerald-950/30 text-emerald-300"
                        : "text-zinc-300 hover:bg-zinc-800/60"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Wand2 className="w-3.5 h-3.5" />
                      <span className="font-medium">Auto-detect</span>
                    </span>
                    {autoDetect && <Check className="w-3.5 h-3.5" />}
                  </button>

                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-600">
                    Manual
                  </div>
                  <div className="max-h-64 overflow-y-auto pb-1">
                    {LANGUAGES.map((lang) => {
                      const selected = !autoDetect && lang.id === language;
                      return (
                        <button
                          key={lang.id}
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            onLanguageChange(lang.id);
                            onAutoDetectChange(false);
                            setLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors ${
                            selected
                              ? "bg-zinc-800/80 text-zinc-100"
                              : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-zinc-600 w-7">.{lang.ext}</span>
                            {lang.label}
                          </span>
                          {selected && <Check className="w-3.5 h-3.5 text-zinc-300" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {(status === "success" || status === "error") && (
            <button
              onClick={() => onCollapsedChange(!codeCollapsed)}
              className="p-1 rounded hover:bg-zinc-800 transition-colors"
              aria-label={codeCollapsed ? "코드 펼치기" : "코드 접기"}
            >
              <ChevronDown
                className={`w-4 h-4 text-zinc-500 transition-transform ${codeCollapsed ? "" : "rotate-180"}`}
              />
            </button>
          )}
        </div>
        {!codeCollapsed && (
          <textarea
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            disabled={status !== "idle"}
            spellCheck={false}
            placeholder="여기에 코드를 붙여넣으세요..."
            className="w-full px-5 py-4 bg-transparent text-sm text-zinc-200 font-mono leading-relaxed resize-none focus:outline-none disabled:opacity-60 placeholder:text-zinc-700 min-h-60"
            style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
          />
        )}
      </div>
    </section>
  );
}
