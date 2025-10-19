// src/components/LeetCodeProfileCard.jsx
import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchLcDashboard, fetchLcCalendar } from "../../lib/adapters/leetcode";
import { settingsStore } from "../../lib/settingsStore";
import YearHeatmap from "./YearHeatmap";
import PercentHistogram from "./PercentHistogram";

const fmtNum = (n) => (n === null || n === undefined ? "-" : n.toLocaleString());
const pct = (x) => {
  if (x === null || x === undefined) return "-";
  const n = Number(x);
  const val = n <= 1 ? n * 100 : n;
  return `${val.toFixed(2)}%`;
};

function fmtDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default function LeetCodeProfileCard({ username }) {
  const user = username || (settingsStore?.handles?.leetcode) || "leetcode";

  const { data, isLoading, error } = useQuery({
    queryKey: ["lc-dashboard-backend", user],
    queryFn: () => fetchLcDashboard(user),
    enabled: !!user,
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const queryClient = useQueryClient();
  const currentYear = new Date().getUTCFullYear();
  const [calYear, setCalYear] = React.useState(currentYear);

  const { data: cal } = useQuery({
    queryKey: ["lc-calendar", user, calYear],
    queryFn: () => fetchLcCalendar(user, calYear),
    enabled: !!user,
    staleTime: 10 * 60_000,
  });

  const contests = data?.contests ?? { rating: null, globalRanking: null, attended: 0, topPercentage: null, history: [], meta: [], dist: [], totalParticipants: 0 };
  const badges   = data?.badges   ?? [];
  const solved   = data?.solved   ?? { easy: 0, medium: 0, hard: 0, totalBank: {} };
  const calendar = cal ?? data?.calendar ?? { streak: 0, days: [] };

  const totalSolved = (solved.easy || 0) + (solved.medium || 0) + (solved.hard || 0);
  const totalBank   = (solved.totalBank?.easy || 0) + (solved.totalBank?.medium || 0) + (solved.totalBank?.hard || 0);
  const solvedPct   = totalBank ? Math.round((totalSolved / totalBank) * 100) : 0;

  const withDenominator = (n, denom) => {
    const left = fmtNum(n);
    if (!Number.isFinite(denom) || !denom) return left;
    return <>{left}<span className="text-slate-400 text-xs">/{denom.toLocaleString()}</span></>;
  };

  const prefetchYear = (year) => queryClient.prefetchQuery({
    queryKey: ["lc-calendar", user, year],
    queryFn: () => fetchLcCalendar(user, year),
    staleTime: 10 * 60_000,
  });

  return (
    <div className="sl-window relative rounded-xl border border-cyan-400/20 bg-[radial-gradient(1200px_400px_at_-10%_-20%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(800px_300px_at_110%_-30%,rgba(168,85,247,0.06),transparent_50%)] bg-slate-950/80 p-3 text-slate-100 shadow-[0_0_0_1px_rgba(56,189,248,0.15)_inset,0_10px_40px_-20px_rgba(56,189,248,0.35)]">
      <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_3px)] rounded-xl" />
      <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.2em] text-cyan-300/80">System</div>
          <div className="text-xs text-slate-400">Player @{user}</div>
        </div>
        {isLoading ? <div className="text-xs text-slate-400">Syncing…</div> : null}
        {error ? <div className="text-xs text-amber-300">Signal lost</div> : null}
      </div>

      {/* Row 1: Contest rating + histogram */}
      <div className="mt-1 grid grid-cols-1">
        <div className="rounded-lg bg-slate-950/70 p-3 ring-1 ring-cyan-400/20 relative">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left: three stats + interactive line */}
            <div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="text-[11px] text-cyan-300/70">Level</div>
                  <div className="text-2xl font-semibold text-slate-100">{fmtNum(contests.rating)}</div>
                </div>
                <div>
                  <div className="text-[11px] text-cyan-300/70">Global Rank</div>
                  <div className="text-base font-medium text-slate-100">
                    {withDenominator(contests.globalRanking, contests.totalParticipants)}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-cyan-300/70">Raids</div>
                  <div className="text-base font-medium text-slate-100">{fmtNum(contests.attended)}</div>
                </div>
              </div>

              <InteractiveRatingChart values={contests.history || []} meta={contests.meta || []} compact />
            </div>

            {/* Right: compact histogram */}
            <div className="md:border-l md:border-cyan-400/20 md:pl-4">
              <PercentHistogram
                rating={contests.rating ?? 0}
                topPercent={contests.topPercentage ?? null}
                dist={contests.dist || []}
                totalParticipants={contests.totalParticipants || 0}
                history={contests.history || []}
                width={520}
                height={160}
                padding={22}
                paddingLeft={44}
                paddingRight={16}
                paddingTop={16}
                paddingBottom={28}
                showLabels={false}

                // new props for theme
                theme="system"
                useGradient
                useGlow
                markerColor="#22d3ee"         // optional if theme="system"
                highlightBarColor="#22d3ee"   // optional if theme="system"
                barColor="#0ea5e9"            // optional if theme="system"
                axisColor="#7dd3fc"           // optional if theme="system"
                fontFamily="system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Solved and Badges */}
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Solved */}
        <div className="rounded-lg bg-slate-950/70 p-3 ring-1 ring-cyan-400/20 relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="flex items-start justify-between">
            <div className="text-[11px] text-cyan-300/70">Quest Progress</div>
            <div className="rounded-md bg-slate-900/70 px-2 py-0.5 text-[10px] text-slate-200 ring-1 ring-cyan-400/20">
              {totalSolved.toLocaleString()} • {solvedPct}%
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4">
            {/* progress ring */}
            <div className="relative h-24 w-24">
              <svg viewBox="0 0 120 120" className="h-24 w-24">
                <circle cx="60" cy="60" r="40" className="stroke-slate-800" strokeWidth="10" fill="none" />
                <circle
                  cx="60" cy="60" r="40" fill="none"
                  stroke="url(#gradSolve)"
                  strokeWidth="10" strokeLinecap="round"
                  strokeDasharray={`${Math.max(0.001, solvedPct) * 2.51} 999`}
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="gradSolve" x1="0" x2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-2 rounded-full bg-slate-900/60 backdrop-blur-sm ring-1 ring-cyan-400/20 grid place-items-center">
                <div className="text-2xl font-semibold text-slate-100">{totalSolved}</div>
                <div className="text-[9px] -mt-1 text-slate-400">total</div>
              </div>
            </div>

            {/* difficulty bars */}
            <div className="flex-1">
              {[
                { k: "Easy",   v: solved.easy   || 0, t: solved.totalBank?.easy,   c: "text-emerald-400", bar: "bg-emerald-500" },
                { k: "Medium", v: solved.medium || 0, t: solved.totalBank?.medium, c: "text-sky-300",     bar: "bg-sky-400" },
                { k: "Hard",   v: solved.hard   || 0, t: solved.totalBank?.hard,   c: "text-violet-300",  bar: "bg-violet-400" },
              ].map((row) => {
                const p = row.t ? Math.min(100, Math.round((row.v / row.t) * 100)) : 0;
                return (
                  <div key={row.k} className="mb-1.5 last:mb-0">
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className={row.c}>{row.k}</span>
                      <span className="tabular-nums text-slate-200">
                        {row.v.toLocaleString()}{row.t ? <span className="text-slate-500">/{row.t.toLocaleString()}</span> : null}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-900">
                      <div className={`h-full ${row.bar}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 text-[11px] text-slate-400">
            System: daily quests synced
          </div>
        </div>

        {/* Badges */}
        <div className="rounded-lg bg-slate-950/70 p-3 ring-1 ring-cyan-400/20 relative overflow-hidden">
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-cyan-300/70">Artifacts</div>
            <div className="text-lg text-slate-200">{fmtNum(badges.length || 0)}</div>
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {(badges || []).slice(0, 8).map((b) => (
              <div key={b.id} className="flex items-center gap-2">
                <img src={b.icon} alt={b.name} className="h-7 w-7 rounded-md border border-cyan-400/20 bg-slate-900/60" />
                <span className="text-[10px] text-slate-300 line-clamp-1">{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Heatmap */}
      <div className="mt-3 grid grid-cols-1">
        <div className="rounded-lg bg-slate-950/80 p-3 ring-1 ring-cyan-400/20">
          <YearHeatmap
            days={calendar.days || []}
            activeYear={calYear}
            onPrevYear={() => { const y = calYear - 1; setCalYear(y); }}
            onNextYear={() => { const y = Math.min(currentYear, calYear + 1); setCalYear(y); }}
            theme="system"
          />
        </div>
      </div>
    </div>
  );
}

/* ----- Interactive subcomponents (theme colors) ----- */
function InteractiveRatingChart({ values = [], meta = [], compact = false }) {
  const w = 560, h = compact ? 120 : 140, pad = compact ? 8 : 10, areaH = h - 2 * pad;
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

  const point = has && iHover >= 0 ? {
    rating: values[iHover],
    meta: meta?.[iHover] || {},
    x: xAt(iHover),
    y: yAt(iHover)
  } : null;

  const leftLabel  = meta?.[0]?.startTime ? new Date(meta[0].startTime).getFullYear() : "2023";
  const rightLabel = meta?.[values.length - 1]?.startTime ? new Date(meta[values.length - 1].startTime).getFullYear() : "2024";

  return (
    <div className="mt-3">
      <div className="relative h-36 w-full">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: `${h}px` }}>
          {has && (
            <>
              <defs>
                <linearGradient id="systemArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path
                d={`${dLine} L ${pad + (values.length - 1) * step} ${h - pad} L ${pad} ${h - pad} Z`}
                fill="url(#systemArea)" />
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
            {point.meta?.title && <div className="text-slate-300">{point.meta.title}</div>}
            <div className="text-slate-400">
              {point.meta?.startTime ? fmtDate(point.meta.startTime) : `Point`}
            </div>
            {(Number.isFinite(point.meta?.rank) || Number.isFinite(point.meta?.problemsSolved)) && (
              <div className="text-slate-400">
                {Number.isFinite(point.meta?.rank) ? <>Rank {fmtNum(point.meta.rank)}</> : null}
                {Number.isFinite(point.meta?.problemsSolved) ? <> · Solved {point.meta.problemsSolved}</> : null}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
