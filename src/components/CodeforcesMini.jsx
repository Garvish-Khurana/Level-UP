// src/components/CodeforcesMini.jsx
import { useQuery } from "@tanstack/react-query";
import PlatformMiniCard from "./PlatformMiniCard";

// Backend adapter: { handle, rating, maxRating, rank, contests, solvedCount, history: [...] }
async function getJSON(url) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function fetchCfSummary(handle) {
  return getJSON(`/api/codeforces/${encodeURIComponent(handle)}/summary`);
}

export default function CodeforcesMini({ handle }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cf-mini", handle],
    queryFn: () => fetchCfSummary(handle),
    enabled: !!handle,
    staleTime: 10 * 60_000,
  });

  // Compute Δ30d from history on the client (cheap) if backend doesn’t include it explicitly
  let delta30 = 0;
  if (data?.history && data.history.length > 0) {
    const nowSec = Math.floor(Date.now() / 1000);
    const day30 = nowSec - 30 * 24 * 3600;
    const before = [...data.history].reverse().find(h => h.ratingUpdateTimeSeconds <= day30);
    const current = data.history[data.history.length - 1].newRating ?? data.rating ?? 0;
    delta30 = current - (before?.newRating ?? current);
  }

  const cur = isLoading ? "…" : String(data?.rating ?? 0);
  const max = isLoading ? "…" : String(data?.maxRating ?? 0);
  const d30 = isLoading ? "…" : `${delta30 >= 0 ? "+" : ""}${delta30}`;

  return (
    <PlatformMiniCard
      title="Codeforces"
      subtitle="Rating trend"
      stats={[
        { label: "Cur", value: cur },
        { label: "Max", value: max },
        { label: "Δ30d", value: d30 },
      ]}
    />
  );
}
