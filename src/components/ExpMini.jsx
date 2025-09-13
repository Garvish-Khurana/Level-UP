export default function ExpMini({ percent = 68 }) {
  const pct = Math.min(100, Math.max(0, percent)); // clamp 0–100
  return (
    <div className="w-28 h-2 rounded bg-slate-800/80 ring-1 ring-white/5 overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-400"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
