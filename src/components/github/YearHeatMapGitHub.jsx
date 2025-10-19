// src/components/YearHeatmap.jsx
import React from "react";

// default palette (dark -> bright)
const STEPS = ["#0b1320", "#1f2a44", "#2c3d64", "#3b5a8c", "#4c74b7", "#60a5fa"];

// build dynamic thresholds from data (quantile-ish)
function makeThresholds(max) {
  if (!max || max <= 1) return [0, 1, 1, 1, 1, 1];
  const t1 = Math.max(1, Math.ceil(max * 0.10));
  const t2 = Math.max(t1 + 1, Math.ceil(max * 0.25));
  const t3 = Math.max(t2 + 1, Math.ceil(max * 0.50));
  const t4 = Math.max(t3 + 1, Math.ceil(max * 0.75));
  const t5 = Math.max(t4 + 1, max);
  return [0, t1, t2, t3, t4, t5];
}

export default function YearHeatmap({
  days = [],
  activeYear,
  onPrevYear,
  onNextYear,
  fromISO,
  toISO,
  hideHeader = false,
}) {
  const map = new Map(days.map(d => [d.date, d.count || 0]));

  // bounds: either [fromISO, toISO) or calendar year
  let from, to;
  if (fromISO && toISO) {
    from = new Date(fromISO);
    to = new Date(toISO);
  } else {
    from = new Date(Date.UTC(activeYear, 0, 1));
    to = new Date(Date.UTC(activeYear + 1, 0, 1));
  }

  // pad to full weeks (start Sunday, end Saturday)
  const first = new Date(from);
  first.setUTCDate(first.getUTCDate() - first.getUTCDay());
  const last = new Date(to);
  const pad = 6 - last.getUTCDay();
  last.setUTCDate(last.getUTCDate() + (pad >= 0 ? pad : 6));

  // thresholds from data
  const maxCount = days.reduce((m, d) => Math.max(m, Number(d.count) || 0), 0);
  const T = makeThresholds(maxCount);

  function colorFor(c) {
    if (!c) return STEPS[0];
    if (c >= T[5]) return STEPS[5];
    if (c >= T[4]) return STEPS[4];
    if (c >= T[3]) return STEPS[3];
    if (c >= T[2]) return STEPS[2];
    return STEPS[1];
  }

  // cells + month ticks
  const cells = [];
  const monthTicks = [];
  let col = 0;

  // margins for labels
  const left = 22;
  const top = 16;
  const size = 11, gap = 2;

  let prevMonth = -1;
  for (let d = new Date(first); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const row = d.getUTCDay();
    if (row === 0 && d > first) col += 1;

    const key = d.toISOString().slice(0, 10);
    const count = map.get(key) || 0;

    cells.push({ x: col, y: row, date: key, count });

    const inWindow = d >= from && d < to;
    if (inWindow && d.getUTCDate() === 1 && d.getUTCMonth() !== prevMonth) {
      monthTicks.push({ x: col, label: d.toLocaleString("en-US", { month: "short" }) });
      prevMonth = d.getUTCMonth();
    }
  }

  const cols = (cells.length ? Math.max(...cells.map(c => c.x)) : 0) + 1;
  const w = left + cols * (size + gap) + 2;
  const h = top + 7 * (size + gap) + 4;

  return (
    <div>
      {!hideHeader && (
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            {fromISO && toISO ? "Activity • last 12 months" : `Activity • ${activeYear}`}
          </div>
          <div className="flex gap-2">
            {onPrevYear ? (
              <button className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300" onClick={onPrevYear}>Prev</button>
            ) : null}
            {onNextYear ? (
              <button className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300" onClick={onNextYear}>Next</button>
            ) : null}
          </div>
        </div>
      )}

      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        {/* month labels */}
        {monthTicks.map((m, i) => (
          <text key={`m${i}`} x={left + m.x * (size + gap)} y={12} fontSize="10" fill="#9ca3af">
            {m.label}
          </text>
        ))}

        {/* weekday labels (Mon, Wed, Fri) */}
        {[
          { y: 1, label: "Mon" },
          { y: 3, label: "Wed" },
          { y: 5, label: "Fri" },
        ].map((t, i) => (
          <text key={`w${i}`} x={0} y={top + t.y * (size + gap) + 9} fontSize="9" fill="#9ca3af">
            {t.label}
          </text>
        ))}

        {/* cells */}
        {cells.map((c, i) => (
          <rect
            key={i}
            x={left + c.x * (size + gap)}
            y={top + c.y * (size + gap)}
            width={size}
            height={size}
            rx={2}
            ry={2}
            fill={colorFor(c.count)}
          >
            <title>{`${c.date}: ${c.count}`}</title>
          </rect>
        ))}

        {/* legend */}
        <g transform={`translate(${w - 120}, ${h - 8})`}>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={i * (size - 3)}
              y={-10}
              width={size - 4}
              height={size - 4}
              rx={2}
              fill={[STEPS[0], STEPS[1], STEPS[2], STEPS[3], STEPS[5]][i]}
            />
          ))}
          <text x={-30} y={-3} fontSize="9" fill="#9ca3af">Less</text>
          <text x={5 * (size - 3) + 4} y={-3} fontSize="9" fill="#9ca3af">More</text>
        </g>
      </svg>
    </div>
  );
}
