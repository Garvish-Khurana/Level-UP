export default function Penalty() {
const options = [
{ id: "focus", name: "Focus 45m" },
{ id: "gist", name: "Editorial write‑up (200+ words)" },
{ id: "resolve", name: "Re‑solve LC Medium+/CF ≥1400" },
{ id: "gh", name: "GitHub contribution" },
];
return (
<div className="space-y-6">
<h1 className="text-sm uppercase tracking-[0.2em] text-slate-300">Penalty Zone</h1>
<div className="rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 border border-amber-400/25 p-6">
<p className="text-slate-200">An overdue mission requires a penalty to revive streaks.</p>
<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
{options.map((o) => (
<button key={o.id} className="px-3 py-2 rounded-lg border border-amber-400/30 text-amber-200 hover:border-amber-400/60 text-left">
{o.name}
</button>
))}
</div>
<div className="mt-4 text-xs text-slate-400">Select one to start. A countdown will begin.</div>
</div>
</div>
);
}