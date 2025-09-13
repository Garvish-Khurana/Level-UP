import { useQuery } from "@tanstack/react-query";
import PlatformMiniCard from "./PlatformMiniCard";
import { fetchLcSummary } from "../lib/adapters/leetcode";
import { settingsStore } from "../lib/settingsStore";

export default function LeetCodeMini({ username }) {
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
subtitle="Solves / 30d"
stats={[
{ label: "E", value: e },
{ label: "M", value: m },
{ label: "H", value: h },
]}
/>
);
}