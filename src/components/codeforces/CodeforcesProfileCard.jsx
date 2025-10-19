// src/components/CodeforcesProfileCard.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsStore } from "../../lib/settingsStore";
import YearHeatmap from "../leetcode/YearHeatmap";

// Dashboard aggregator (already exists server-side)
async function fetchCfDashboard(handle) {
  const res = await fetch(`/api/dashboard?cf=${encodeURIComponent(handle)}`, { headers: { "Cache-Control": "no-cache" } });
  if (!res.ok) throw new Error(`CF fetch failed: ${res.status}`);
  return res.json();
}

// Yearly submissions calendar (new route below)
async function fetchCfCalendar(handle, year) {
  const res = await fetch(`/api/codeforces/${encodeURIComponent(handle)}/calendar/${year}`);
  if (!res.ok) throw new Error(`CF calendar ${res.status}`);
  return res.json(); // { days:[{date,count}], streak:number }
}

const fmtNum = (n) => (Number.isFinite(n) ? n.toLocaleString() : "-");
const fmtDate = (sec) => new Date(sec * 1000).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

export default function CodeforcesProfileCard({ handle }) {
  const user = handle || settingsStore?.handles?.codeforces || "codeforces";

  const { data, isLoading, error } = useQuery({
    queryKey: ["cf-dashboard", user],
    queryFn: () => fetchCfDashboard(user),
    enabled: !!user,
    staleTime: 5 * 60_000,
    retry: 0,
  });

  // activity year state
  const currentYear = new Date().getUTCFullYear();
  const [calYear, setCalYear] = React.useState(currentYear);

  const { data: cal } = useQuery({
    queryKey: ["cf-calendar", user, calYear],
    queryFn: () => fetchCfCalendar(user, calYear),
    enabled: !!user,
    staleTime: 10 * 60_000,
  });

  const cf = data?.codeforces ?? {
    handle: user,
    rating: null,
    maxRating: null,
    rank: null,
    contests: 0,
    solvedCount: 0,
    history: [],
  };

  const ratings = (cf.history || []).map((h) => Number(h.newRating)).filter(Number.isFinite);
  const times = (cf.history || []).map((h) => Number(h.ratingUpdateTimeSeconds)).filter(Number.isFinite);

  return (
    <div className="sl-window relative rounded-xl border border-cyan-400/20 bg-[radial-gradient(1200px_400px_at_-10%_-20%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(800px_300px_at_110%_-30%,rgba(168,85,247,0.06),transparent_50%)] bg-slate-950/80 p-4 text-slate-100 shadow-[0_0_0_1px_rgba(56,189,248,0.15)_inset,0_10px_40px_-20px_rgba(56,189,248,0.35)]">
      <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_3px)] rounded-xl" />
      <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">System</div>
          <div className="text-sm text-slate-400">Player @{cf.handle || user}</div>
        </div>
        {isLoading ? <div className="text-xs text-slate-400">Syncing…</div> : null}
        {error ? <div className="text-xs text-amber-300">Signal lost</div> : null}
      </div>

      {/* Row 1: stats + rating line */}
      <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg bg-slate-950/80 p-3 ring-1 ring-cyan-400/20">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="text-[11px] text-cyan-300/70">Level</div>
              <div className="text-2xl font-semibold text-slate-100">{fmtNum(cf.rating)}</div>
            </div>
            <div>
              <div className="text-[11px] text-cyan-300/70">Max Level</div>
              <div className="text-base font-medium text-slate-100">{fmtNum(cf.maxRating)}</div>
            </div>
            <div>
              <div className="text-[11px] text-cyan-300/70">Rank</div>
              <div className="text-base font-medium text-slate-100">{cf.rank || "-"}</div>
            </div>
          </div>
          <InteractiveRatingChart values={ratings} times={times} />
        </div>

        {/* Counters + last contest */}
        <div className="rounded-lg bg-slate-950/80 p-3 ring-1 ring-cyan-400/20">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md bg-slate-900/70 p-3 ring-1 ring-cyan-400/20">
              <div className="text-[11px] text-cyan-300/70">Raids</div>
              <div className="text-xl font-semibold text-slate-100">{fmtNum(cf.contests)}</div>
              <div className="mt-1 text-[11px] text-slate-400">attended</div>
            </div>
            <div className="rounded-md bg-slate-900/70 p-3 ring-1 ring-cyan-400/20">
              <div className="text-[11px] text-cyan-300/70">Solved</div>
              <div className="text-xl font-semibold text-slate-100">{fmtNum(cf.solvedCount)}</div>
              <div className="mt-1 text-[11px] text-slate-400">unique problems</div>
            </div>
          </div>

          {/* Last contest summary */}
          <div className="mt-3 rounded-md bg-slate-900/60 p-3 ring-1 ring-cyan-400/20">
            <div className="text-[11px] text-cyan-300/70">Last Raid</div>
            {cf.history?.length ? (
              (() => {
                const last = cf.history[cf.history.length - 1];
                const delta = (last?.newRating ?? 0) - (last?.oldRating ?? 0);
                return (
                  <div className="mt-1 text-sm text-slate-200">
                    <div className="line-clamp-1">{last?.contestName || "-"}</div>
                    <div className="text-[11px] text-slate-400">
                      {fmtDate(last?.ratingUpdateTimeSeconds)} • {fmtNum(last?.oldRating)} → {fmtNum(last?.newRating)}{" "}
                      (<span className={delta >= 0 ? "text-emerald-400" : "text-rose-400"}>{delta >= 0 ? "+" : ""}{fmtNum(delta)}</span>)
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="mt-1 text-sm text-slate-400">No raid history</div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Activity heatmap */}
      <div className="mt-3 grid grid-cols-1">
        <div className="rounded-lg bg-slate-950/80 p-3 ring-1 ring-cyan-400/20">
          <YearHeatmap
            days={cal?.days || []}
            activeYear={calYear}
            onPrevYear={() => setCalYear((y) => y - 1)}
            onNextYear={() => setCalYear((y) => Math.min(currentYear, y + 1))}
          />
        </div>
      </div>

      {/* Row 3: All previous contests */}
      <div className="mt-3 rounded-lg bg-slate-950/80 p-3 ring-1 ring-cyan-400/20">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-cyan-300/70">Raid log</div>
          <div className="text-[11px] text-slate-400">{fmtNum(cf.history?.length || 0)} total</div>
        </div>
        <div className="max-h-64 overflow-y-auto pr-1">
          {(cf.history || []).slice().reverse().map((h) => {
            const delta = (h.newRating ?? 0) - (h.oldRating ?? 0);
            return (
              <div key={h.contestId} className="flex items-center justify-between py-1.5 border-b border-cyan-400/15 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm text-slate-200 truncate">{h.contestName}</div>
                  <div className="text-[11px] text-slate-400">{fmtDate(h.ratingUpdateTimeSeconds)}</div>
                </div>
                <div className="ml-3 text-right">
                  <div className="text-sm text-slate-200">{fmtNum(h.oldRating)} → {fmtNum(h.newRating)}</div>
                  <div className={`text-[11px] ${delta >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{delta >= 0 ? "+" : ""}{fmtNum(delta)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Compact CF rating line (System colors) */
function InteractiveRatingChart({ values = [], times = [] }) {
  const w = 560, h = 120, pad = 8, areaH = h - 2 * pad;
  const has = values?.length > 0;
  const min = has ? Math.min(...values) : 0;
  const max = has ? Math.max(...values) : 1;
  const norm = (x) => (max === min ? 0.5 : (x - min) / (max - min));
  const step = has ? (w - 2 * pad) / Math.max(1, values.length - 1) : 0;

  const [iHover, setIHover] = React.useState(has ? values.length - 1 : -1);
  const xAt = (i) => pad + i * step;
  const yAt = (i) => h - pad - norm(values[i]) * areaH;

  const dLine = React.useMemo(() => {
    if (!has) return "";
    let d = `M ${pad} ${h - pad - norm(values[0]) * areaH}`;
    values.forEach((v, i) => { d += ` L ${pad + i * step} ${h - pad - norm(v) * areaH}`; });
    return d;
  }, [has, values, step]);

  const point = has && iHover >= 0 ? { rating: values[iHover], when: times?.[iHover] || null, x: xAt(iHover), y: yAt(iHover) } : null;

  return (
    <div className="mt-3">
      <div className="relative h-36 w-full">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: `${h}px` }}>
          {has && (
            <>
              <defs>
                <linearGradient id="cfSystemArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={`${dLine} L ${pad + (values.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`} fill="url(#cfSystemArea)" />
              <path d={dLine} stroke="#22d3ee" strokeWidth="2" fill="none" />
              {point && (
                <>
                  <line x1={point.x} y1={pad} x2={point.x} y2={h - pad} stroke="#22d3ee30" strokeWidth="1" />
                  <circle cx={point.x} cy={point.y} r="3.4" fill="#fff" stroke="#a78bfa" strokeWidth="1.8" />
                </>
              )}
              {values.map((_, i) => (
                <rect
                  key={i}
                  x={pad + (i - 0.5) * step}
                  y={0}
                  width={step || (w - 2 * pad)}
                  height={h}
                  fill="transparent"
                  onMouseEnter={() => setIHover(i)}
                  onMouseMove={() => setIHover(i)}
                  onFocus={() => setIHover(i)}
                />
              ))}
            </>
          )}
        </svg>
        {point && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full rounded-md bg-slate-900/95 px-2 py-1 text-[10px] text-slate-200 ring-1 ring-cyan-700/40 backdrop-blur-sm"
            style={{ left: `${(point.x / w) * 100}%`, top: `${(point.y / h) * 100}%` }}>
            <div className="font-medium">Rating {fmtNum(point.rating)}</div>
            <div className="text-slate-400">{point.when ? fmtDate(point.when) : "Point"}</div>
          </div>
        )}
      </div>
    </div>
  );
}
