import { NavLink } from "react-router-dom";
const link = "block px-4 py-2 rounded-lg text-slate-300 hover:text-cyan-300 hover:border-cyan-400/40 border border-transparent";
export default function Sidebar() {
return (
<aside className="hidden md:block w-64 shrink-0 p-4 bg-slate-950/60 backdrop-blur ring-1 ring-white/10 border-r border-cyan-400/20">
<nav className="space-y-2">
<NavLink className={link} to="/">Dashboard</NavLink>
<NavLink className={link} to="/missions">Missions</NavLink>
<NavLink className={link} to="/penalty">Penalty Zone</NavLink>
<NavLink className={link} to="/leaderboards">Leaderboards</NavLink>
<NavLink className={link} to="/settings">Settings</NavLink>
</nav>
</aside>
);
}