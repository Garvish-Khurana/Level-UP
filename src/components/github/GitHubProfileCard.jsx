// src/components/GitHubProfileCard.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsStore } from "../../lib/settingsStore";
import { ghFetchSummary, ghFetchCalendar, ghFetchRepoRollup } from "../../lib/githubClient";
import YearHeatmap from "./YearHeatMapGitHub";

const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString() : "-");

// total from days
function sumCounts(days) {
  return (days || []).reduce((a, d) => a + (Number(d.count) || 0), 0);
}

// current streak from a days array (rolling or fixed range)
function currentStreakFromDays(days = []) {
  if (!days.length) return 0;
  const map = new Map(days.map(d => [d.date, d.count || 0]));
  // find last available date in the set
  const lastKey = days[days.length - 1].date;
  let cur = new Date(lastKey + "T12:00:00Z");
  let run = 0;
  while (true) {
    const key = cur.toISOString().slice(0, 10);
    const v = map.get(key) || 0;
    if (v > 0) {
      run += 1;
      cur.setUTCDate(cur.getUTCDate() - 1);
    } else {
      break;
    }
  }
  return run;
}

export default function GitHubProfileCard({ login }) {
  const ghLogin = login || settingsStore?.handles?.github || "Garvish-Khurana";
  const profileUrl = `https://github.com/${ghLogin}`;

  // summary
  const { data: sum } = useQuery({
    queryKey: ["gh-summary", ghLogin],
    queryFn: () => ghFetchSummary(ghLogin),
    enabled: !!ghLogin,
    staleTime: 10 * 60_000,
  });

  // repo rollup
  const { data: roll } = useQuery({
    queryKey: ["gh-repos", ghLogin],
    queryFn: () => ghFetchRepoRollup(ghLogin),
    enabled: !!ghLogin,
    staleTime: 30 * 60_000,
  });

  // rolling window controls
  const [showPrivate, setShowPrivate] = React.useState(true);
  const [windowStart, setWindowStart] = React.useState(() => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - 365);
    return d;
  });
  const windowEnd = React.useMemo(() => new Date(), []);

  // rolling calendar fetch (matches GitHub "last year")
  const { data: cal } = useQuery({
    queryKey: [
      "gh-calendar",
      ghLogin,
      "rolling",
      showPrivate,
      windowStart.toISOString().slice(0, 10),
      windowEnd.toISOString().slice(0, 10),
    ],
    queryFn: () =>
      ghFetchCalendar(ghLogin, new Date().getUTCFullYear(), showPrivate, {
        range: "rolling",
        from: windowStart.toISOString(),
        to: windowEnd.toISOString(),
      }),
    enabled: !!ghLogin,
    staleTime: 10 * 60_000,
  });

  const stars = Number.isFinite(sum?.stars) ? sum.stars : roll?.stars;
  const forks = Number.isFinite(sum?.forks) ? sum.forks : roll?.forks;

  // Derived stats (rolling)
  const totalRolling = fmt(sumCounts(cal?.days || []));
  const curStreak = fmt(currentStreakFromDays(cal?.days || []));
  const longStreak = fmt(Number(cal?.streak) || 0);

  // Most used languages (mini bar)
  const langItems = (roll?.topLanguages || sum?.topLanguages || []).slice(0, 5);
  const langTotal = langItems.reduce((a, x) => a + (x.count || 0), 0);

  return (
    <div className="sl-window relative rounded-xl border border-cyan-400/20 bg-[radial-gradient(1200px_400px_at_-10%_-20%,rgba(56,189,248,0.08),transparent_60%),radial-gradient(800px_300px_at_110%_-30%,rgba(168,85,247,0.06),transparent_50%)] bg-slate-950/80 p-4 text-slate-100 shadow-[0_0_0_1px_rgba(56,189,248,0.15)_inset,0_10px_40px_-20px_rgba(56,189,248,0.35)]">
      <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.02)_3px)] rounded-xl" />
      <div className="pointer-events-none absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />

      {/* HERO HEADER */}
      <header className="rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 p-4 ring-1 ring-cyan-400/20">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            {sum?.avatar ? (
              <img
                src={sum.avatar}
                alt=""
                className="h-20 w-20 rounded-full ring-1 ring-cyan-400/20 md:h-24 md:w-24"
              />
            ) : null}
            <div>
              <div className="text-xl font-semibold">{sum?.name || ""}</div>
              <div className="text-sm text-slate-400">Player @{sum?.login || ghLogin}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] text-slate-400">
                {sum?.location ? <span className="inline-flex items-center gap-1">📍 {sum.location}</span> : null}
                {sum?.company ? <span className="inline-flex items-center gap-1">🏢 {sum.company}</span> : null}
                {sum?.blog ? (
                  <a href={sum.blog} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-slate-300 hover:text-white">
                    🔗 {sum.blog}
                  </a>
                ) : null}
                {sum?.createdAt ? (
                  <span className="inline-flex items-center gap-1">🗓 Joined {new Date(sum.createdAt).toLocaleDateString()}</span>
                ) : null}
              </div>
            </div>
          </div>

          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 rounded-lg bg-slate-900/70 px-3 py-2 text-sm text-slate-100 ring-1 ring-cyan-400/20 hover:bg-slate-800"
            title="Open GitHub profile"
          >
            Visit Profile
            <svg className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17L17 7" />
              <path d="M8 7h9v9" />
            </svg>
          </a>
        </div>

        {/* Stat pills */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Pill label="Followers" value={fmt(sum?.followers)} />
          <Pill label="Following" value={fmt(sum?.following)} />
          <Pill label="Repos" value={fmt(sum?.publicRepos)} />
          <Pill label="Stars" value={fmt(stars)} />
          <Pill label="Forks" value={fmt(forks)} />
        </div>

        {/* Bio row */}
        {sum?.bio ? <div className="mt-3 text-sm text-slate-200">{sum.bio}</div> : null}
      </header>

      {/* BODY SECTIONS */}
      <section className="mt-4 space-y-4">
        {/* Activity heatmap */}
        {/* <div className="rounded-lg bg-slate-950/80 p-4 ring-1 ring-cyan-400/20"> */}
          {/* <div className="mb-2 flex items-center justify-between"> */}
            {/* <div className="text-[11px] uppercase tracking-wide text-cyan-300/70">System • last 12 months</div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-[11px] text-slate-300">
                <input type="checkbox" checked={showPrivate} onChange={(e) => setShowPrivate(e.target.checked)} />
                Include private
              </label>
              <button
                className="rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-300 ring-1 ring-cyan-400/20 hover:bg-slate-800"
                onClick={() => {
                  const d = new Date(windowStart);
                  d.setUTCDate(d.getUTCDate() - 365);
                  setWindowStart(d);
                }}
              >
                Prev
              </button>
              <button
                className="rounded bg-slate-900 px-2 py-1 text-[11px] text-slate-300 ring-1 ring-cyan-400/20 hover:bg-slate-800"
                onClick={() => {
                  const d = new Date(windowStart);
                  d.setUTCDate(d.getUTCDate() + 365);
                  setWindowStart(d);
                }}
              >
                Next
              </button>
            </div>
          </div>

          <YearHeatmap
            days={cal?.days || []}
            fromISO={windowStart.toISOString()}
            toISO={windowEnd.toISOString()}
            hideHeader
          />
          <div className="mt-2 text-[11px] text-cyan-300/70">
            Total contributions: {totalRolling} • Current streak: {curStreak} • Longest streak: {longStreak}
            {showPrivate ? " • includes private" : ""}
          </div>
        </div> */}

        {/* GitHub stats and snake + mini languages */}
        <div className="rounded-lg bg-slate-950/80 p-4 ring-1 ring-cyan-400/20">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-cyan-300/70">System Stats</div>

          <div className="flex flex-col gap-4 lg:flex-row">
            {/* Snake */}
            <div className="flex-1 rounded-lg bg-slate-950/80 p-4 ring-1 ring-cyan-400/20">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-cyan-300/70">Contribution Snake</div>
              <div className="flex items-center justify-center">
                <img
                  src={`https://raw.githubusercontent.com/${ghLogin}/${ghLogin}/output/github-contribution-grid-snake-dark.svg`}
                  alt="Contribution snake"
                  className="h-[150px]"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Languages mini-bar */}
            <div className="flex-1 rounded-md bg-slate-900/70 p-4 ring-1 ring-cyan-400/20">
              <div className="mb-2 text-[11px] text-cyan-300/70">Most Used Languages</div>
              <div className="space-y-2">
                {langItems.length ? (
                  langItems.map(({ lang, count }) => {
                    const pct = langTotal ? Math.round((count * 100) / langTotal) : 0;
                    return (
                      <div key={lang}>
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="truncate">{lang}</span>
                          <span className="text-slate-400">{pct}%</span>
                        </div>
                        <div className="mt-1 h-2 w-full rounded bg-slate-800">
                          <div className="h-2 rounded bg-cyan-400" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-sm text-slate-400">No data</div>
                )}
              </div>
            </div>
          </div>

          {/* Embeds */}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <img
              alt="GitHub stats"
              src={`https://github-readme-stats.vercel.app/api?username=${ghLogin}&theme=tokyonight&show_icons=true&hide_border=false&count_private=true`}
              height={150}
              className="w-full rounded-md ring-1 ring-cyan-400/20"
              loading="lazy"
            />
            <img
              alt="GitHub streak"
              src={`https://github-readme-streak-stats.herokuapp.com/?user=${ghLogin}&theme=tokyonight&count_private=true`}
              height={150}
              className="w-full rounded-md ring-1 ring-cyan-400/20"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function Pill({ label, value }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-sm ring-1 ring-cyan-400/20">
      <span className="text-[11px] text-cyan-300/70">{label}</span>
      <span className="font-semibold text-slate-100">{value}</span>
    </div>
  );
}

function Tile({ k, v }) {
  return (
    <div className="rounded-md bg-slate-900/70 p-3 ring-1 ring-cyan-400/20">
      <div className="text-[11px] text-cyan-300/70">{k}</div>
      <div className="text-xl font-semibold text-slate-100">{v}</div>
    </div>
  );
}

function Big({ k, v }) {
  return (
    <div className="rounded-md bg-slate-900/70 p-3 ring-1 ring-cyan-400/20">
      <div className="text-[11px] text-cyan-300/70">{k}</div>
      <div className="text-2xl font-semibold text-slate-100">{v}</div>
    </div>
  );
}
