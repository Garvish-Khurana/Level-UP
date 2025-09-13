import clsx from "clsx";

export default function KpiTile({ label, value, delta, hint, right }) {
return (
<div className="min-h-[112px] rounded-xl bg-slate-900/60 backdrop-blur border border-cyan-400/15 ring-1 ring-white/10 p-4 hover:shadow-[0_8px_24px_rgba(56,189,248,.18)] transition">
<div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">{label}</div>
<div className="mt-1 flex items-end justify-between gap-3">
<div className="text-2xl font-semibold tabular-nums text-slate-100 drop-shadow-[0_0_8px_rgba(56,189,248,.25)]">{value}</div>
{right}
</div>
<div className="mt-2 flex items-center justify-between">
<span
className={clsx(
"px-2 py-0.5 rounded-full text-[11px] uppercase tracking-widest border",
delta?.startsWith("+")
? "border-emerald-400/25 text-emerald-300"
: delta?.startsWith("-")
? "border-rose-400/25 text-rose-300"
: "border-white/10 text-slate-300"
)}
>
{delta ?? "—"}
</span>
<span className="text-[11px] text-slate-400">{hint}</span>
</div>
</div>
);
}