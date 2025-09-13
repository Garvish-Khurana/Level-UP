import { useQuery } from "@tanstack/react-query";
import { fetchMissionsToday } from "../lib/mockApi";

export default function Missions() {
const { data, isLoading } = useQuery({ queryKey: ["missions-today"], queryFn: fetchMissionsToday });

if (isLoading) return <div className="text-slate-400">Loading…</div>;

const groups = {
Pending: data.filter((m) => m.status === "Pending"),
Verified: data.filter((m) => m.status === "Verified"),
Overdue: data.filter((m) => m.status === "Overdue"),
};

return (
<div className="space-y-6">
<h1 className="text-sm uppercase tracking-[0.2em] text-slate-300">Missions</h1>
{Object.entries(groups).map(([k, list]) => (
<section key={k} className="rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 border border-cyan-400/15 p-4">
<div className="mb-3 text-slate-200">{k} - {list.length}</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
{list.map((m) => (
<div key={m.id} className="rounded-xl border border-white/10 p-4">
<div className="text-slate-200">{m.title}</div>
<div className="text-xs text-slate-400">{m.desc}</div>
<div className="mt-2 text-xs text-slate-500">Due in {m.countdown}</div>
</div>
))}
</div>
</section>
))}
</div>
);
}