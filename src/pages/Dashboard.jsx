// src/pages/Dashboard.jsx
import AvatarUploader from "../components/AvatarUploader";
import UserSummary from "../components/UserSummary";
import MissionStrip from "../components/MissionStrip";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardKpis } from "../lib/mockApi";
import KpiTile from "../components/KpiTile";
import ExpMini from "../components/ExpMini";
import { settingsStore } from "../lib/settingsStore";
import LeetCodeProfileCard from "../components/leetcode/LeetCodeProfileCard";
import CodeforcesProfileCard from "../components/codeforces/CodeforcesProfileCard";
import GitHub from "./GitHub";

export default function Dashboard() {
  function KpiBand() {
    const { data, isLoading } = useQuery({
      queryKey: ["dashboard-kpis"],
      queryFn: fetchDashboardKpis,
      staleTime: 5 * 60_000,
    });
    if (isLoading) return <div className="text-cyan-300/70">System: syncing KPIs…</div>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {(data || []).map((k, i) => (
          <KpiTile
            key={i}
            label={k.label}
            value={k.value}
            delta={k.delta}
            hint={k.hint}
            right={
              k.right?.type === "expMini" ? (
                <ExpMini percent={k.right.percent} showPercent thickness={8} />
              ) : null
            }
          />
        ))}
      </div>
    );
  }

  const lcHandle = settingsStore.handles.leetcode || "leetcode";

  return (
    <div className="space-y-6">
      {/* Row 0: Profile header + Mission strip + KPI band */}
      <div className="sl-window relative p-6 rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-cyan-400/20 border border-cyan-400/20 text-slate-100 shadow-[0_0_0_1px_rgba(56,189,248,0.15)_inset,0_10px_40px_-20px_rgba(56,189,248,0.35)] bg-[radial-gradient(1200px_400px_at_-10%_-20%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(800px_300px_at_110%_-30%,rgba(168,85,247,0.06),transparent_50%)]">
        <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_3px)] rounded-2xl" />
        <div className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-3">
              <AvatarUploader />
            </div>
            <div className="col-span-12 md:col-span-9">
              <UserSummary />
            </div>
          </div>
          <MissionStrip />
          <KpiBand />
        </div>
      </div>

      {/* Platform cards */}
      <div>
        <LeetCodeProfileCard username={lcHandle} />
      </div>
      <div>
        <CodeforcesProfileCard handle={settingsStore.handles.codeforces || "tourist"} />
      </div>
      <div>
        <GitHub />
      </div>

      {/* Row 2: Optional future layout */}
      {/* <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <ActivityHeatmap days={140} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <PlatformMiniGrid />
        </div>
      </div> */}
    </div>
  );
}
