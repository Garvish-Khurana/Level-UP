export default function TopBar() {
return (
<header className="sticky top-0 z-40 h-14 bg-slate-950/70 backdrop-blur ring-1 ring-white/10 border-b border-cyan-400/20 flex items-center px-4">
<div className="text-cyan-300 font-semibold tracking-widest uppercase">Level UP</div>
<div className="ml-auto flex items-center gap-3">
<button className="px-3 py-1 rounded-lg border border-cyan-400/30 text-cyan-200 hover:border-cyan-400/60">Notifications</button>
<div className="size-8 rounded-full bg-slate-800 ring-1 ring-white/10 border border-cyan-400/20" />
</div>
</header>
);
}