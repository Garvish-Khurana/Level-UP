import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function RatingBands() {
const data = [
{ d: "W1", R1200: 5, R1400: 3, R1600: 2, R2000: 0 },
{ d: "W2", R1200: 4, R1400: 2, R1600: 1, R2000: 1 },
];

return (
<div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-6">
<div className="text-sm text-slate-200">Codeforces - Solved by rating bands</div>
<div className="h-64 mt-3">
<ResponsiveContainer width="100%" height="100%">
<BarChart data={data}>
<XAxis dataKey="d" tick={{ fill: "#94a3b8" }} />
<YAxis tick={{ fill: "#94a3b8" }} />
<Tooltip />
<Legend />
<Bar dataKey="R1200" stackId="x" fill="rgba(56,189,248,0.7)" />
<Bar dataKey="R1400" stackId="x" fill="rgba(52,211,153,0.75)" />
<Bar dataKey="R1600" stackId="x" fill="rgba(250,204,21,0.85)" />
<Bar dataKey="R2000" stackId="x" fill="rgba(244,63,94,0.9)" />
</BarChart>
</ResponsiveContainer>
</div>
</div>
);
}