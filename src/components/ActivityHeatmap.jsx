import { useMemo } from "react";

function DayCell({ level = 0 }) {
const shades = [
"bg-cyan-400/0",
"bg-cyan-400/15",
"bg-cyan-400/30",
"bg-cyan-400/50",
"bg-cyan-400/70",
];
return (

<div className={`size-3 rounded-[3px] ${shades[level]} hover:shadow-[0_0_10px_rgba(56,189,248,.45)] transition`} /> );}

export default function ActivityHeatmap({ days = 140 }) {
const data = useMemo(
() => Array.from({ length: days }, () => Math.floor(Math.random() * 5)),
[days]
);


// Render in columns (GitHub-style)
const columns = 20;

return (
<div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-6">
<div className="mb-4 flex items-center gap-2">
<button className="px-3 py-1 rounded-full border border-cyan-400/25 text-slate-300 hover:text-cyan-300">
All
</button>
<button className="px-3 py-1 rounded-full border border-cyan-400/25 text-slate-300 hover:text-cyan-300">
LeetCode
</button>
<button className="px-3 py-1 rounded-full border border-cyan-400/25 text-slate-300 hover:text-cyan-300">
Codeforces
</button>
<button className="px-3 py-1 rounded-full border border-cyan-400/25 text-slate-300 hover:text-cyan-300">
GitHub
</button>
</div>
  <div
    className="grid gap-[6px]"
    style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
  >
    {data.map((lvl, i) => (
      <DayCell key={i} level={lvl} />
    ))}
  </div>

  <div className="mt-4 text-[11px] text-slate-400">
    Last ~{days} days -  placeholder data
  </div>
</div>
);
}