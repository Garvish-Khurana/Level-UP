// src/components/YearHeatmap.jsx
import React from "react";

const STEPS = ["#0b1320", "#1f2a44", "#2c3d64", "#3b5a8c", "#4c74b7", "#60a5fa"]; // dark->bright

function colorFor(c) {
  if (!c) return STEPS[0];
  if (c >= 16) return STEPS[5];
  if (c >= 8) return STEPS[4];
  if (c >= 4) return STEPS[3];
  if (c >= 2) return STEPS[2];
  return STEPS[1];
}

export default function YearHeatmap({ days = [], activeYear, onPrevYear, onNextYear }) {
  // build a map and full-year grid (Sun..Sat rows, week columns)
  const map = new Map(days.map(d => [d.date, d.count]));
  const start = new Date(Date.UTC(activeYear, 0, 1));
  const end = new Date(Date.UTC(activeYear + 1, 0, 1));
  const cells = [];
  let col = 0;
  // place from the first Sunday on/after Jan 1 for tidy columns
  const first = new Date(start);
  first.setUTCDate(first.getUTCDate() - first.getUTCDay());
  for (let d = new Date(first); d < end; d.setUTCDate(d.getUTCDate() + 1)) {
    const row = d.getUTCDay();
    if (row === 0 && cells.length) col++;
    const key = d.toISOString().slice(0, 10);
    const count = map.get(key) || 0;
    cells.push({ x: col, y: row, date: key, count });
  }

  const size = 11, gap = 2;
  const w = (Math.max(...cells.map(c => c.x), 0) + 1) * (size + gap) + 30;
  const h = 7 * (size + gap) + 20;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-zinc-400">Activity • {activeYear}</div>
        <div className="flex gap-2">
          <button className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300" onClick={onPrevYear}>Prev</button>
          <button className="rounded bg-zinc-800 px-2 py-1 text-[11px] text-zinc-300" onClick={onNextYear}>Next</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
        {cells.map((c, i) => (
          <rect key={i}
            x={c.x * (size + gap)} y={c.y * (size + gap)}
            width={size} height={size} rx={2} ry={2}
            fill={colorFor(c.count)}>
            <title>{`${c.date}: ${c.count}`}</title>
          </rect>
        ))}
      </svg>
    </div>
  );
}
