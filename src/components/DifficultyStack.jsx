import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DifficultyStack() {
// placeholder last 2 weeks
const data = [
{ d: "W1", Easy: 6, Medium: 8, Hard: 2 },
{ d: "W2", Easy: 7, Medium: 6, Hard: 1 },
];

return (
<div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-6">
<div className="text-sm text-slate-200">LeetCode - Difficulty mix</div>
<div className="h-64 mt-3">
<ResponsiveContainer width="100%" height="100%">
<BarChart
data={data}
stackOffset="expand"
margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
>
<XAxis dataKey="d" tick={{ fill: "#94a3b8" }} />
<YAxis
tickFormatter={(v) => String(Math.round(v * 100)) + "%"}
tick={{ fill: "#94a3b8" }}
/>
<Tooltip />
<Legend />
<Bar dataKey="Easy" stackId="a" fill="rgba(56,189,248,0.8)" />
<Bar dataKey="Medium" stackId="a" fill="rgba(168,85,247,0.8)" />
<Bar dataKey="Hard" stackId="a" fill="rgba(99,102,241,0.9)" />
</BarChart>
</ResponsiveContainer>
</div>
</div>
);
}