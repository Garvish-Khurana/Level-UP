const rows = [
{ rank: 1, name: "Shadow Coder", score: 1280 },
{ rank: 2, name: "Algo Knight", score: 1140 },
{ rank: 3, name: "Graph Wizard", score: 980 },
];

export default function Leaderboards() {
return (
<div className="space-y-6">
<h1 className="text-sm uppercase tracking-[0.2em] text-slate-300">Leaderboards</h1>
<div className="rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 border border-cyan-400/15 p-6">
<div className="mb-3 text-slate-200">Weekly - Party</div>
<div className="divide-y divide-white/5">
{rows.map((r) => (
<div key={r.rank} className="py-3 flex items-center justify-between">
<div className="flex items-center gap-3">
<div className="w-8 text-slate-400 tabular-nums">#{r.rank}</div>
<div className="text-slate-200">{r.name}</div>
</div>
<div className="text-slate-100 font-semibold tabular-nums">{r.score}</div>
</div>
))}
</div>
</div>
</div>
);
}