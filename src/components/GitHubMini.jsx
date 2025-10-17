// src/components/GitHubMini.jsx
import { useQuery } from "@tanstack/react-query";
import PlatformMiniCard from "./PlatformMiniCard";
import { settingsStore } from "../lib/settingsStore";

// Simple helpers that call the backend
async function getJSON(url) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchGhSummary(login) {
  // { login, name, publicRepos, followers, stars, forks, eventsLast30Days }
  return getJSON(`/api/github/${encodeURIComponent(login)}/summary`);
}

// Optional: lightweight events-based today/week approximation (client-side).
// If not needed, remove this and the related query below.
async function fetchGhTodayWeek(login) {
  const events = await getJSON(`https://api.github.com/users/${encodeURIComponent(login)}/events?per_page=100`);
  const now = new Date();
  const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenAgo = now.getTime() - 7 * 24 * 3600 * 1000;

  let today = 0, week = 0;
  for (const e of events) {
    const t = new Date(e.created_at).getTime();
    if (t >= sevenAgo) week++;
    if (t >= sod) today++;
  }
  return { today, week };
}

export default function GitHubMini(props) {
  const username = props.username || settingsStore.handles?.github || "octocat";
  const subtitle = "Public stats";

  const { data, isLoading } = useQuery({
    queryKey: ["gh-summary", username],
    queryFn: () => fetchGhSummary(username),
    enabled: !!username,
    staleTime: 10 * 60_000,
  });

  // Optional secondary query; set enabled to false to skip if not required.
  const { data: tw } = useQuery({
    queryKey: ["gh-today-week", username],
    queryFn: () => fetchGhTodayWeek(username),
    enabled: !!username && Boolean(props.showTodayWeek),
    staleTime: 5 * 60_000,
  });

  const val = (x) => (isLoading ? "…" : (x ?? 0).toLocaleString());

  const stats = [
    { label: "Repos", value: val(data?.publicRepos) },
    { label: "Stars", value: val(data?.stars) },
    { label: "Forks", value: val(data?.forks) },
    { label: "Followers", value: val(data?.followers) },
  ];

  if (props.showTodayWeek) {
    stats.unshift({ label: "Today", value: isLoading ? "…" : String(tw?.today ?? 0) });
    stats.unshift({ label: "Week", value: isLoading ? "…" : String(tw?.week ?? 0) });
  } else {
    stats.unshift({ label: "Activity 30d", value: val(data?.eventsLast30Days) });
  }

  return (
    <PlatformMiniCard
      title="GitHub"
      subtitle={subtitle}
      stats={stats}
    />
  );
}
