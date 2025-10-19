// src/components/YearHeatmap.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Day = { date: string; count: number };

type RenderCol =
  | { kind: "days"; dates: (string | null)[] }
  | { kind: "spacer" };

function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}
function colorFor(v: number) {
  if (v <= 0) return "bg-zinc-800";
  if (v <= 1) return "bg-emerald-900";
  if (v <= 3) return "bg-emerald-700";
  if (v <= 5) return "bg-emerald-500";
  return "bg-emerald-300";
}

export default function YearHeatmap({
  days = [] as Day[],
  activeYear,
  onPrevYear,
  onNextYear,
}: {
  days?: Day[];
  activeYear?: number;
  onPrevYear?: () => void;
  onNextYear?: () => void;
}) {
  const [range, setRange] = useState<"current" | "year">("current");
  const [open, setOpen] = useState(false);
  const pop = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!pop.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const model = useMemo(() => {
    const countMap = new Map<string, number>();
    for (const d of days) countMap.set(d.date, Number(d.count) || 0);

    const end = new Date();
    end.setUTCHours(12, 0, 0, 0);

    const start = new Date(end);
    if (activeYear) {
      const s = new Date(Date.UTC(activeYear, 0, 1, 12, 0, 0, 0));
      const e = new Date(Date.UTC(activeYear + 1, 0, 1, 12, 0, 0, 0));
      start.setTime(s.getTime());
      end.setTime(e.getTime());
    } else if (range === "current") {
      start.setUTCDate(end.getUTCDate() - 7 * 53 + 1);
    } else {
      start.setUTCDate(end.getUTCDate() - 365);
    }

    const renderCols: RenderCol[] = [];
    const monthAnchors: Array<{ idx: number; label: string }> = [];
    const seenMonthAtIdx = new Set<number>();

    let cursor = new Date(start);
    for (let c = 0; c < 53; c++) {
      const dcol: string[] = [];
      for (let r = 0; r < 7; r++) {
        const key = new Date(cursor).toISOString().slice(0, 10);
        dcol.push(key);
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      const firstIdx = dcol.findIndex((iso) => iso.slice(8, 10) === "01");
      if (firstIdx > 0) {
        const left: (string | null)[] = dcol.map((d, i) => (i < firstIdx ? d : null));
        const right: (string | null)[] = dcol.map((d, i) => (i >= firstIdx ? d : null));
        renderCols.push({ kind: "days", dates: left });
        renderCols.push({ kind: "spacer" });
        const rightIdx = renderCols.length;
        renderCols.push({ kind: "days", dates: right });

        const mm = Math.max(0, Math.min(11, Number(dcol[firstIdx].slice(5, 7)) - 1));
        if (!seenMonthAtIdx.has(rightIdx)) {
          monthAnchors.push({ idx: rightIdx, label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mm] });
          seenMonthAtIdx.add(rightIdx);
        }
      } else if (firstIdx === 0) {
        renderCols.push({ kind: "spacer" });
        const colIdx = renderCols.length;
        renderCols.push({ kind: "days", dates: dcol });
        const mm = Math.max(0, Math.min(11, Number(dcol[0].slice(5, 7)) - 1));
        if (!seenMonthAtIdx.has(colIdx)) {
          monthAnchors.push({ idx: colIdx, label: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][mm] });
          seenMonthAtIdx.add(colIdx);
        }
      } else {
        renderCols.push({ kind: "days", dates: dcol });
      }
    }

    let total = 0, active = 0, maxStreak = 0, run = 0;
    {
      const t = new Date(start);
      for (let i = 0; i < 53 * 7; i++) {
        const key = new Date(t).toISOString().slice(0, 10);
        const v = countMap.get(key) || 0;
        total += v;
        if (v > 0) { active += 1; run += 1; if (run > maxStreak) maxStreak = run; } else run = 0;
        t.setUTCDate(t.getUTCDate() + 1);
      }
    }

    const totalCols = renderCols.length;
    return { renderCols, monthAnchors, totalCols, total, active, maxStreak, range, countMap };
  }, [days, activeYear, range]);

  const canNext = activeYear ? activeYear < new Date().getUTCFullYear() : false;

  return (
    <div className="w-full">
      {/* Header with year navigation */}
      <div className="mb-3 flex items-center justify-between text-zinc-400 text-xs">
        <div>
          <span className="text-zinc-100 font-medium">{model.total.toLocaleString()}</span>
          {" "}submissions {activeYear ? `in ${activeYear}` : "in the past one year"}
        </div>
        <div className="flex items-center gap-2">
          {/* {typeof activeYear === "number" && (
            <>
              <button
                className="rounded-md border border-zinc-700 px-2 py-0.5 bg-zinc-900 text-zinc-200"
                onClick={onPrevYear}
                aria-label="Previous year"
              >
                ◀ {activeYear - 1}
              </button>
              <button
                className="rounded-md border border-zinc-700 px-2 py-0.5 bg-zinc-900 text-zinc-200 disabled:opacity-50"
                onClick={onNextYear}
                disabled={!canNext}
                aria-label="Next year"
              >
                {activeYear + 1} ▶
              </button>
            </>
          )} */}
          {/* Range dropdown kept for non-year mode */}
          <div ref={pop} className="relative z-20">
            {/* <button
              className="rounded-md border border-zinc-700 px-2 py-0.5 bg-zinc-900 text-zinc-200"
              onClick={() => setOpen(v => !v)}
            >
              {activeYear ? `Year ${activeYear}` : (model.range === "current" ? "Current" : "Past year")} ▾
            </button> */}
            {open && !activeYear && (
              <div className="absolute right-0 mt-1 w-28 rounded-md border border-zinc-700 bg-zinc-900/95 shadow-lg">
                <div
                  className={cls("px-2 py-1 cursor-pointer hover:bg-zinc-800", model.range === "current" && "text-emerald-300")}
                  onClick={() => { setOpen(false); setRange("current"); }}>
                  Current
                </div>
                <div
                  className={cls("px-2 py-1 cursor-pointer hover:bg-zinc-800", model.range === "year" && "text-emerald-300")}
                  onClick={() => { setOpen(false); setRange("year"); }}>
                  Past year
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid with month split-gaps */}
      <div className="relative">
        <div
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${model.totalCols}, minmax(0, 1fr))` }}>
          {model.renderCols.map((col, ci) => {
            if (col.kind === "spacer") {
              return <div key={`sp-${ci}`} className="flex flex-col gap-1" aria-hidden="true" />;
            }
            return (
              <div key={`c-${ci}`} className="relative flex flex-col gap-1">
                {col.dates.map((d, ri) => {
                  if (!d) return <div key={`cell-${ci}-${ri}`} className="h-2 w-2 rounded-[3px] bg-transparent" />;
                  const v = model.countMap.get(d) || 0;
                  return <div key={`cell-${ci}-${ri}`} className={cls("h-2 w-2 rounded-[3px]", colorFor(v))} title={`${d} • ${v}`} />;
                })}
              </div>
            );
          })}
        </div>

        {/* Month labels */}
        <div className="mt-2 relative h-4 text-[10px] text-zinc-400">
          {model.monthAnchors.map(({ idx, label }) => (
            <div
              key={`lbl-${label}-${idx}`}
              className="absolute"
              style={{ left: `calc(${(idx / model.totalCols) * 100}% + 2px)` }}>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
