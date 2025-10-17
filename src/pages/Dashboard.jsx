// src/pages/Dashboard.jsx
import AvatarUploader from "../components/AvatarUploader";
import UserSummary from "../components/UserSummary";
import MissionStrip from "../components/MissionStrip";
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardKpis } from "../lib/mockApi"; // keep mock KPIs for now
import KpiTile from "../components/KpiTile";
import ExpMini from "../components/ExpMini";
import ActivityHeatmap from "../components/ActivityHeatmap";
import PlatformMiniCard from "../components/PlatformMiniCard";
import DifficultyStack from "../components/DifficultyStack";
import RatingBands from "../components/RatingBands";
import ContestTimeline from "../components/ContestTimeline";
import AchievementFeed from "../components/AchievementFeed";
import GitHubMini from "../components/GitHubMini";
import CodeforcesMini from "../components/CodeforcesMini";
import LeetCodeMini from "../components/LeetCodeMini";
import { settingsStore } from "../lib/settingsStore";
import LeetCodeProfileCard from "../components/LeetCodeProfileCard";

export default function Dashboard() {
  function KpiBand() {
    const { data, isLoading } = useQuery({
      queryKey: ["dashboard-kpis"],
      queryFn: fetchDashboardKpis,
      staleTime: 5 * 60_000,
    });
    if (isLoading) return <div className="text-slate-400">Loading KPIs…</div>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {(data || []).map((k, i) => (
          <KpiTile
            key={i}
            label={k.label}
            value={k.value}
            delta={k.delta}
            hint={k.hint}
            right={k.right?.type === "expMini" ? <ExpMini percent={k.right.percent} /> : null}
          />
        ))}
      </div>
    );
  }

  function PlatformMiniGrid() {
    const ghUser = settingsStore.handles.github || "octocat";
    const cfHandle = settingsStore.handles.codeforces || "tourist";
    const lcUser = settingsStore.handles.leetcode || "leetcode";
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LeetCodeMini username={lcUser} />
        <CodeforcesMini handle={cfHandle} />
        <GitHubMini username={ghUser} />
      </div>
    );
  }

  const lcHandle = settingsStore.handles.leetcode || "leetcode"; // NEW

  return (
    <div className="space-y-6">
      {/* Row 0: Profile header + Mission strip + KPI band */}
      <div className="panel p-6 rounded-2xl bg-slate-900/60 backdrop-blur ring-1 ring-white/10 border border-cyan-400/20">
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

      {/* LeetCode Profile Card hooked to backend via adapter */}
      <div>
        <LeetCodeProfileCard username={lcHandle} /> {/* NEW: pass explicit handle */}
      </div>

      {/* Row 2: Heatmap (8 cols) + Platform mini-cards (4 cols) */}
      {/* <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <ActivityHeatmap days={140} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <PlatformMiniGrid />
        </div>
      </div> */}

      {/* Row 3: Depth & insights */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <DifficultyStack />
          <RatingBands />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ContestTimeline />
          <AchievementFeed />
        </div>
      </div>
    </div>
  );
}
