export default function UserSummary() {
const level = 12;
const exp = 2340;
const next = 2800;

return (

<div className="rounded-2xl bg-slate-900/60 backdrop-blur ring-1
 ring-white/10 border border-cyan-400/20 p-6 grid gap-4"> 
 <div className="flex items-center gap-3"> 
    <h2 className="text-2xl font-semibold tracking-wide drop-shadow-[0_0_8px_rgba(56,189,248,.35)]">Shadow Coder</h2> 
    <span className="px-3 py-1 rounded-full border border-cyan-400/30 bg-slate-900/70 text-cyan-200 text-xs 
    shadow-[0_0_12px_rgba(56,189,248,.35)]">Rank: B
    </span> 
    </div>
    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-slate-300">
  <span className="px-2 py-0.5 rounded-full border border-cyan-400/20">LC linked</span>
  <span className="px-2 py-0.5 rounded-full border border-cyan-400/20">CF linked</span>
  <span className="px-2 py-0.5 rounded-full border border-cyan-400/20">GH linked</span>
</div>

<div className="grid gap-2">
  <div className="flex items-center justify-between">
    <div className="text-slate-300">Level {level}</div>
    <div className="text-slate-400 text-sm">EXP {exp}/{next}</div>
  </div>
  <div className="h-3 w-full rounded-full bg-slate-800/80 ring-1 ring-white/5 overflow-hidden">
    <div
      className="h-3 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-400 shadow-[0_0_16px_rgba(56,189,248,.45)]"
      style={{ width: `${Math.min(100, (exp / next) * 100)}%` }}
    />
  </div>
</div>

<div className="grid gap-1">
  <div className="h-1.5 rounded bg-slate-800/80 overflow-hidden">
    <div className="h-1.5 bg-cyan-400/80" style={{ width: "65%" }} />
  </div>
  <div className="text-xs text-slate-400">Next rank progress: 65%</div>
</div>

<div className="text-xs text-slate-400">Local TZ: IST -  GitHub counts in UTC</div>
</div> );
}

