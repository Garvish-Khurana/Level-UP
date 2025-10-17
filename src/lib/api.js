// src/lib/api.js
export async function getJSON(url) {
  const res = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// Unified dashboard hook: GET /api/dashboard?lc=&cf=&gh=
import { useQuery } from "@tanstack/react-query";

export function useDashboard({ lc, cf, gh }) {
  const params = new URLSearchParams();
  if (lc) params.set("lc", lc);
  if (cf) params.set("cf", cf);
  if (gh) params.set("gh", gh);
  const qs = params.toString();

  return useQuery({
    queryKey: ["dashboard", lc || "", cf || "", gh || ""],
    queryFn: () => getJSON(`/api/dashboard?${qs}`),
    enabled: Boolean(lc || cf || gh),
    staleTime: 5 * 60_000,
  });
}
