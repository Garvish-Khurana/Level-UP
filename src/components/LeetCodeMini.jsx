import { useQuery } from "@tanstack/react-query";
import PlatformMiniCard from "./PlatformMiniCard";
import { fetchLcSummary } from "../lib/adapters/leetcode";
import { settingsStore } from "../lib/settingsStore";

export default function LeetCodeMini({ username }) {
  // Prefer explicit username, fall back to user settings, fallback to 'leetcode'
  const user = username || settingsStore.handles.leetcode || "leetcode";
  const { data, isLoading } = useQuery({
    queryKey: ["lc-mini", user],
    queryFn: () => fetchLcSummary(user),
    enabled: !!user,
  });

  const e = isLoading ? "…" : String(data?.easy ?? 0);
  const m = isLoading ? "…" : String(data?.medium ?? 0);
  const h = isLoading ? "…" : String(data?.hard ?? 0);

  return (
    <PlatformMiniCard
      title="LeetCode"
      subtitle="Solved Problems"
      stats={[
        { label: "Easy", value: e },
        { label: "Medium", value: m },
        { label: "Hard", value: h },
      ]}
    />
  );
}
