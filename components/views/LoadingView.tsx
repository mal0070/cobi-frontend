import { Loader2 } from "lucide-react";

export default function LoadingView() {
  return (
    <section className="py-16">
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="relative">
          <div className="w-14 h-14 rounded-full border border-zinc-800" />
          <Loader2 className="w-14 h-14 absolute inset-0 animate-spin text-zinc-300" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-200 mb-1">코드를 분석하고 있어요</p>
          <p className="text-xs text-zinc-500 font-mono">
            Parsing logic → Generating IR → Building views...
          </p>
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
