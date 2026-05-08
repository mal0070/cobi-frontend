import type { DesignerView as DesignerViewType } from "@/types/api";
import { Palette } from "lucide-react";

interface Props {
  data: DesignerViewType;
}

const ACCENT = "rgb(244 114 182)"; // pink-400

export function DesignerView({ data }: Props) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-xs font-mono text-zinc-500">
        <Palette className="w-3.5 h-3.5" style={{ color: ACCENT }} />
        <span>SCREEN STATES</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.screens.map((s, i) => (
          <div
            key={i}
            className="rounded-lg border border-zinc-800 bg-zinc-950/40 overflow-hidden"
          >
            {/* Mock screen frame */}
            <div className="aspect-video bg-zinc-900 border-b border-zinc-800 flex items-center justify-center relative">
              <div className="absolute top-2 left-2 flex gap-1">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
              </div>
              <div className="text-center px-4">
                <div
                  className="inline-block px-2.5 py-1 rounded text-[10px] font-mono mb-2 border"
                  style={{ color: ACCENT, borderColor: ACCENT + "60" }}
                >
                  {s.ui}
                </div>
                <p className="text-xs text-zinc-300">{s.message}</p>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm font-medium text-zinc-200">{s.state}</p>
              </div>
              <p className="text-xs text-zinc-500 font-mono">when: {s.condition}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}