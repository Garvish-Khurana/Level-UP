import { useQuery } from "@tanstack/react-query";
import PlatformMiniCard from "./PlatformMiniCard";
import { fetchCfRatingSummary } from "../lib/adapters/codeforces";

export default function CodeforcesMini({ handle }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cf-mini", handle],
    queryFn: () => fetchCfRatingSummary(handle),
    enabled: !!handle,
  }); // enabled delays query until handle is truthy [2][1][5]

  const cur = isLoading ? "…" : String(data?.current ?? 0); // safe default [2]
  const max = isLoading ? "…" : String(data?.max ?? 0); // safe default [2]
  const d30 = isLoading
    ? "…"
    : `${(data?.delta30 ?? 0) >= 0 ? "+" : ""}${data?.delta30 ?? 0}`; // proper template literal [6][9]

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
