import { useQuery } from "@tanstack/react-query";
import PlatformMiniCard from "./PlatformMiniCard";
import { fetchGhContribSummary } from "../lib/adapters/github";
import { settingsStore } from "../lib/settingsStore";
export default function GitHubMini(props) {
  const username =
    props.username || settingsStore.handles?.github || "octocat";

  const subtitle = settingsStore.githubUtcHint ? "UTC window" : "Local day";

  const { data, isLoading } = useQuery({
    queryKey: ["gh-mini", username],
    queryFn: () => fetchGhContribSummary(username),
    enabled: !!username,
  });

  const today = isLoading ? "…" : String(data?.today ?? 0);
  const week = isLoading ? "…" : String(data?.week ?? 0);

  return (
    <PlatformMiniCard
      title="GitHub"
      subtitle={subtitle}
      stats={[
        { label: "Today", value: today },
        { label: "Week", value: week },
        { label: "Streak", value: "—" },
      ]}
    />
  );
}
