const items = [
{ id: 1, title: "CF Round #981 (Div. 3)", rank: "3124", delta: "+42", time: "3d ago" },
{ id: 2, title: "AtCoder ABC 369", rank: "1895", delta: "+18", time: "10d ago" },
];

export default function ContestTimeline() {
return (
<div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-6">
<div className="text-sm text-slate-200">Contests</div>
<div className="mt-3 space-y-3">
{items.map((it) => (
<div key={it.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-3 flex items-center justify-between">
<div>
<div className="text-slate-200">{it.title}</div>
<div className="text-xs text-slate-400">Rank {it.rank} - {it.time}</div>
</div>
<span className="px-2 py-0.5 rounded-full border border-emerald-400/25 text-emerald-300 text-xs">{it.delta}</span>
</div>
))}
</div>
</div>
);
}