// src/components/YearHeatmap.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Day = { date: string; count: number };

type RenderCol =
  | { kind: "days"; dates: (string | null)[] }
  | { kind: "spacer" };

function cls(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function YearHeatmap({
  days = [] as Day[],
  activeYear,
  onPrevYear,
  onNextYear,
  // NEW: optional System theme toggle for Solo Leveling reskin
  theme = "default", // "default" | "system"
}: {
  days?: Day[];
  activeYear?: number;
  onPrevYear?: () => void;
  onNextYear?: () => void;
  theme?: "default" | "system";
}) {
  const [range, setRange] = useState<"current" | "year">("current");
  const [open, setOpen] = useState(false);
  const pop = useRef<HTMLDivElement>(null);

  const sys = theme === "system";

  // palette per theme (default = emeralds, system = cyan holographic)
  const palette = useMemo(() => {
    if (sys) {
      return {
        empty: "bg-slate-800",
        lvl1: "bg-cyan-900",
        lvl2: "bg-cyan-700",
        lvl3: "bg-cyan-500",
        lvl4: "bg-cyan-300",
        label: "text-cyan-300/70",
        border: "border-cyan-400/20",
        month: "text-cyan-300/70",
      };
    }
    return {
      empty: "bg-zinc-800",
      lvl1: "bg-emerald-900",
      lvl2: "bg-emerald-700",
      lvl3: "bg-emerald-500",
      lvl4: "bg-emerald-300",
      label: "text-zinc-400",
      border: "border-zinc-700",
      month: "text-zinc-400",
    };
  }, [sys]);

  function colorClass(v: number) {
    if (v <= 0) return palette.empty;
    if (v <= 1) return palette.lvl1;
    if (v <= 3) return palette.lvl2;
    if (v <= 5) return palette.lvl3;
    return palette.lvl4;
  }

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
      <div className={cls("mb-3 flex items-center justify-between text-xs", palette.label)}>
        <div>
          <span className="text-zinc-100 font-medium">{model.total.toLocaleString()}</span>
          {" "}submissions {activeYear ? `in ${activeYear}` : "in the past one year"}
        </div>
        <div className="flex items-center gap-2">
          {/* Year buttons intentionally kept commented (unchanged) */}

          {/* Range dropdown kept for non-year mode */}
          <div ref={pop} className="relative z-20">
            {/* Trigger intentionally commented (unchanged) */}
            {open && !activeYear && (
              <div className={cls("absolute right-0 mt-1 w-28 rounded-md bg-zinc-900/95 shadow-lg", sys ? "border border-cyan-400/20" : "border border-zinc-700")}>
                <div
                  className={cls("px-2 py-1 cursor-pointer hover:bg-zinc-800", model.range === "current" && (sys ? "text-cyan-300" : "text-emerald-300"))}
                  onClick={() => { setOpen(false); setRange("current"); }}>
                  Current
                </div>
                <div
                  className={cls("px-2 py-1 cursor-pointer hover:bg-zinc-800", model.range === "year" && (sys ? "text-cyan-300" : "text-emerald-300"))}
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
                  return <div key={`cell-${ci}-${ri}`} className={cls("h-2 w-2 rounded-[3px]", colorClass(v))} title={`${d} • ${v}`} />;
                })}
              </div>
            );
          })}
        </div>

        {/* Month labels */}
        <div className={cls("mt-2 relative h-4 text-[10px]", palette.month)}>
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
