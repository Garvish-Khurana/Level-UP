const feed = [
{ id: 1, title: "PR merged in level-up-ui", sub: "GH - main branch", time: "Today" },
{ id: 2, title: "Streak reached 12 days", sub: "Global", time: "Yesterday" },
{ id: 3, title: "New max CF rating 1568", sub: "CF", time: "Last week" },
];

export default function AchievementFeed() {
return (
<div className="rounded-2xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-6">
<div className="text-sm text-slate-200">Achievements</div>
<div className="mt-3 space-y-3">
{feed.map((f) => (
<div key={f.id} className="rounded-lg border border-white/10 bg-slate-900/60 p-3">
<div className="text-slate-200">{f.title}</div>
<div className="text-xs text-slate-400">{f.sub} - {f.time}</div>
</div>
))}
</div>
</div>
);
}