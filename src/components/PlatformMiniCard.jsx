import Sparkline from "./Sparkline";

export default function PlatformMiniCard({ title, stats = [], subtitle }) {
const data = Array.from({ length: 14 }, () => ({ v: Math.floor(Math.random() * 6) }));
return (
<div className="rounded-xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-4">
<div className="text-sm text-slate-200">{title}</div>
{subtitle && <div className="text-xs text-slate-400">{subtitle}</div>}
<div className="mt-2">
<Sparkline data={data} />
</div>
<div className="mt-2 grid grid-cols-3 gap-2">
{stats.map((s, i) => (
<div key={i} className="rounded-lg border border-white/10 px-2 py-1 text-center">
<div className="text-[11px] text-slate-400">{s.label}</div>
<div className="text-sm font-semibold tabular-nums">{s.value}</div>
</div>
))}
</div>
</div>
);
}