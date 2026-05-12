'use client'
import { Workflow } from "lucide-react";
import { useRouter } from "next/navigation";

function Header() {
  const router = useRouter();

  return (
    <header className="border-b border-zinc-800/80 backdrop-blur-sm sticky top-0 z-10 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-300 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-zinc-900" strokeWidth={2.5} />
            </div>
            <div onClick={()=>router.push('/')}>
              <h1 className="text-base font-semibold tracking-tight">CoBi</h1>
              <p className="text-[11px] text-zinc-500 font-mono uppercase tracking-wider">code → visual → team</p>
            </div>
          </div>
        </div>
      </header>
  )
}

export default Header