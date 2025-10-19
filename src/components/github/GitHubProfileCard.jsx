// src/components/GitHubProfileCard.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { settingsStore } from "../../lib/settingsStore";
import { ghFetchSummary, ghFetchCalendar, ghFetchRepoRollup } from "../../lib/githubClient";
import YearHeatmap from "../leetcode/YearHeatmap";

const fmt = (n) => (Number.isFinite(n) ? n.toLocaleString() : "-");

export default function GitHubProfileCard({ login }) {
  const ghLogin = login || settingsStore?.handles?.github || "octocat";

  const { data: sum } = useQuery({
    queryKey: ["gh-summary", ghLogin],
    queryFn: () => ghFetchSummary(ghLogin),
    enabled: !!ghLogin,
    staleTime: 10 * 60_000,
  });

  const { data: roll } = useQuery({
    queryKey: ["gh-repos", ghLogin],
    queryFn: () => ghFetchRepoRollup(ghLogin),
    enabled: !!ghLogin,
    staleTime: 30 * 60_000,
  });

  const [year, setYear] = React.useState(new Date().getUTCFullYear());
  const [showPrivate, setShowPrivate] = React.useState(true);

  const { data: cal } = useQuery({
    queryKey: ["gh-calendar", ghLogin, year, showPrivate],
    queryFn: () => ghFetchCalendar(ghLogin, year, showPrivate),
    enabled: !!ghLogin,
    staleTime: 10 * 60_000,
  });

  const topLangs = sum?.topLanguages?.length ? sum.topLanguages : (roll?.topLanguages || []);
  const stars = Number.isFinite(sum?.stars) ? sum.stars : roll?.stars;
  const forks = Number.isFinite(sum?.forks) ? sum.forks : roll?.forks;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-zinc-100">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px,1fr]">
        {/* Sidebar */}
        <aside className="rounded-lg bg-zinc-950/90 p-4 ring-1 ring-zinc-800">
          {sum?.avatar ? <img src={sum.avatar} alt="" className="mb-3 h-28 w-28 rounded-full ring-1 ring-zinc-700" /> : null}
          <div className="text-lg font-semibold">{sum?.name || ""}</div>
          <div className="text-sm text-zinc-400">@{sum?.login || ghLogin}</div>

          {sum?.bio ? <div className="mt-3 text-sm text-zinc-200">{sum.bio}</div> : null}
          <ul className="mt-3 space-y-1 text-[12px] text-zinc-400">
            {sum?.company ? <li>🏢 {sum.company}</li> : null}
            {sum?.location ? <li>📍 {sum.location}</li> : null}
            {sum?.blog ? <li>🔗 {sum.blog}</li> : null}
            {sum?.createdAt ? <li>🗓 Joined {new Date(sum.createdAt).toLocaleDateString()}</li> : null}
          </ul>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Tile k="Followers" v={fmt(sum?.followers)} />
            <Tile k="Following" v={fmt(sum?.following)} />
            <Tile k="Repos" v={fmt(sum?.publicRepos)} />
          </div>
        </aside>

        {/* Right column */}
        <section className="space-y-4">
          {/* Highlights */}
          <div className="rounded-lg bg-zinc-950/90 p-4 ring-1 ring-zinc-800">
            <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">Highlights</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Big k="Stars" v={fmt(stars)} />
              <Big k="Forks" v={fmt(forks)} />
              <Big k="Recent Pushes (30d)" v={fmt(sum?.recentPushes)} />
            </div>
          </div>

          {/* Activity */}
          <div className="rounded-lg bg-zinc-950/90 p-4 ring-1 ring-zinc-800">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] uppercase tracking-wide text-zinc-400">Activity {year}</div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[11px] text-zinc-300">
                  <input
                    type="checkbox"
                    checked={showPrivate}
                    onChange={(e) => setShowPrivate(e.target.checked)}
                  />
                  Include private
                </label>
                <button
                  className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300"
                  onClick={() => setYear((y) => y - 1)}
                >
                  Prev
                </button>
                <button
                  className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300"
                  onClick={() => setYear((y) => Math.min(new Date().getUTCFullYear(), y + 1))}
                >
                  Next
                </button>
              </div>
            </div>

            <YearHeatmap
              days={cal?.days || []}
              activeYear={year}
              onPrevYear={() => setYear((y) => y - 1)}
              onNextYear={() => setYear((y) => Math.min(new Date().getUTCFullYear(), y + 1))}
            />
            <div className="mt-2 text-[11px] text-zinc-400">
              {Number.isFinite(cal?.streak) ? `Longest streak: ${fmt(cal.streak)} days` : ""}
              {showPrivate ? " • includes private" : ""}
            </div>
          </div>

          {/* Languages + totals */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-zinc-950/90 p-4 ring-1 ring-zinc-800">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">Top Languages</div>
              <ul className="mt-1 text-sm text-zinc-200">
                {topLangs?.length ? topLangs.map(({ lang, count }) => (
                  <li key={lang} className="flex items-center justify-between border-b border-zinc-800/60 py-1 last:border-0">
                    <span className="truncate">{lang}</span>
                    <span className="text-[11px] text-zinc-400">{fmt(count)}</span>
                  </li>
                )) : <li className="text-sm text-zinc-400">No data</li>}
              </ul>
            </div>

            <div className="rounded-lg bg-zinc-950/90 p-4 ring-1 ring-zinc-800">
              <div className="mb-2 text-[11px] uppercase tracking-wide text-zinc-400">Totals</div>
              <div className="grid grid-cols-3 gap-3">
                <Tile k="Stars" v={fmt(stars)} />
                <Tile k="Forks" v={fmt(forks)} />
                <Tile k="Gists" v={fmt(sum?.publicGists)} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Tile({ k, v }) {
  return (
    <div className="rounded-md bg-zinc-900/80 p-3 ring-1 ring-zinc-800">
      <div className="text-[11px] text-zinc-400">{k}</div>
      <div className="text-xl font-semibold text-zinc-100">{v}</div>
    </div>
  );
}

function Big({ k, v }) {
  return (
    <div className="rounded-md bg-zinc-900/80 p-3 ring-1 ring-zinc-800">
      <div className="text-[11px] text-zinc-400">{k}</div>
      <div className="text-2xl font-semibold text-zinc-100">{v}</div>
    </div>
  );
}
