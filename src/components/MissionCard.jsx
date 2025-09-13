export default function MissionCard({
status = "Pending",
title = "Mission",
desc = "",
right = null,
countdown = "05:12:31",
onVerify,
onDetails,
}) {
const statusClasses =
status === "Verified"
? "bg-emerald-500/15 text-emerald-300 border-emerald-500/20"
: status === "Overdue"
? "bg-amber-500/15 text-amber-300 border-amber-500/20"
: "bg-slate-800/80 text-slate-300 border-white/10";

return (
<div className=" rounded-xl bg-slate-900/70 backdrop-blur border border-cyan-400/20 ring-1 ring-white/5 p-4 hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(56,189,248,.25)] transition " >
<div className="flex items-start justify-between gap-3">
<div>
<div className="text-sm text-slate-200">{title}</div>
{desc ? <div className="text-xs text-slate-400 mt-1">{desc}</div> : null}
</div>
{right}
</div>
  <div className="mt-3 flex items-center justify-between">
    <span className={`px-2 py-0.5 rounded-full border ${statusClasses} text-xs`}>
      {status}
    </span>
    <span className="font-mono tabular-nums text-cyan-300">{countdown}</span>
  </div>

  <div className="mt-3 flex gap-2">
    <button
      type="button"
      onClick={typeof onVerify === "function" ? onVerify : undefined}
      className="
        inline-flex items-center justify-center
        px-3 py-1.5 rounded-lg
        bg-gradient-to-r from-cyan-500 to-fuchsia-500
        text-slate-900 text-sm font-semibold
        shadow-[0_0_14px_rgba(56,189,248,.45)]
        hover:shadow-[0_0_18px_rgba(56,189,248,.65)]
        transition
      "
    >
      Verify
    </button>
    <button
      type="button"
      onClick={onDetails}
      className="
        px-3 py-1.5 rounded-lg border
        border-cyan-400/30 text-cyan-200 text-sm
        hover:border-cyan-400/60
        transition
      "
    >
      Details
    </button>
  </div>
</div>
);
}