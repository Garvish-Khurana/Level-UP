// src/components/PercentHistogram.jsx
import React, { useMemo, useState } from "react";

function fmtNum(n) { return Number.isFinite(n) ? n.toLocaleString() : "-"; }
function fmtRange(a, b) { if (!Number.isFinite(a) || !Number.isFinite(b)) return "-"; return `${Math.round(a)}–${Math.round(b)}`; }

export default function PercentHistogram({
  rating = 0,
  topPercent = null,
  dist = [],
  totalParticipants = 0,
  history = [],
  width = 560,
  height = 180,
  paddingLeft = 44,
  paddingRight = 16,
  paddingTop = 16,
  paddingBottom = 28,
  axisFontSize = 10,
  markerFontSize = 10, // smaller to avoid clipping
  barColor = "#475569",
  highlightBarColor = "#60a5fa",
  markerColor = "#ef4444",
  axisColor = "#64748b",
  fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  showLabels = false,
  assumeNormalized = undefined,
  ratingRange = [800, 3500],
}) {
  // unify padding vars
  const padL = paddingLeft, padR = paddingRight, padT = paddingTop, padB = paddingBottom;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  // bins
  const bins = useMemo(() => {
    if (!Array.isArray(dist)) return [];
    return dist
      .map(b => ({ start: Number(b?.start), end: Number(b?.end), count: Number(b?.count) }))
      .filter(b => Number.isFinite(b.start) && Number.isFinite(b.end) && Number.isFinite(b.count));
  }, [dist]);

  const rawMin = useMemo(() => (bins.length ? Math.min(...bins.map(b => b.start)) : 0), [bins]);
  const rawMax = useMemo(() => (bins.length ? Math.max(...bins.map(b => b.end)) : 1), [bins]);

  const autoNormalized = useMemo(() => {
    const span = rawMax - rawMin;
    const ratingLooksLarge = Number.isFinite(rating) && rating >= 500;
    return ratingLooksLarge && span <= 2;
  }, [rawMin, rawMax, rating]);

  const normalized = assumeNormalized ?? autoNormalized;
  const [rx0, rx1] = normalized ? ratingRange : [rawMin, rawMax];

  // scales honoring asymmetric paddings
  const xToPx = (x) => {
    const val = normalized ? ratingRange[0] + x * (ratingRange[1] - ratingRange[0]) : x;
    if (rx1 === rx0) return padL;
    return padL + ((val - rx0) / (rx1 - rx0)) * innerW;
  };
  const yMax = useMemo(() => (bins.length ? Math.max(...bins.map(b => b.count)) || 1 : 1), [bins]);
  const yToPx = (y) => padT + innerH - (y / yMax) * innerH;

  const userBinIndex = useMemo(() => {
    if (!bins.length || !Number.isFinite(rating)) return -1;
    if (normalized) {
      const t = (rating - ratingRange[0]) / (ratingRange[1] - ratingRange[0]);
      return bins.findIndex(b => t >= b.start && t < b.end);
    }
    return bins.findIndex(b => rating >= b.start && rating < b.end);
  }, [bins, rating, normalized, ratingRange]);

  const xTicks = 6, yTicks = 4;
  const xTickVals = Array.from({ length: xTicks }, (_, i) => Math.round(rx0 + (i * (rx1 - rx0)) / (xTicks - 1)));
  const yTickVals = Array.from({ length: yTicks }, (_, i) => Math.round((i * yMax) / (yTicks - 1)));

  const participants = Number.isFinite(totalParticipants) && totalParticipants > 0
    ? totalParticipants
    : bins.reduce((a, b) => a + (b.count || 0), 0);

  const [hoverI, setHoverI] = useState(-1);
  const hoverBin = hoverI >= 0 ? bins[hoverI] : null;

  const empty = !bins.length || !(Number.isFinite(rx0) && Number.isFinite(rx1) && rx1 > rx0);

  const markerX = (() => {
    if (!Number.isFinite(rating) || rx1 === rx0) return null;
    const x = padL + ((rating - rx0) / (rx1 - rx0)) * innerW;
    return Math.max(padL, Math.min(padL + innerW, x));
  })();

  return (
    <div className="mt-1">
      <div className="mb-4 flex items-baseline justify-between">
        <div className="text-xs text-zinc-400" style={{ fontFamily }}>
          Rating distribution
          {Number.isFinite(rating) ? <> • current {Math.round(rating)}</> : null}
          {Number.isFinite(topPercent) ? <> • top {(Number(topPercent) <= 1 ? Number(topPercent) * 100 : Number(topPercent)).toFixed(2)}%</> : null}
        </div>
        {participants > 0 ? (
          <div className="text-[11px] text-zinc-500" style={{ fontFamily }}>
            participants {fmtNum(participants)}
          </div>
        ) : null}
      </div>

      <div className="relative">
        <svg width={width} height={height} role="img" aria-label="Contest rating histogram" style={{ overflow: "visible" }}>
          {/* Axes */}
          <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke={axisColor} strokeWidth={1} />
          <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke={axisColor} strokeWidth={1} />

          {/* X ticks */}
          {xTickVals.map((v, i) => {
            const x = rx1 === rx0 ? padL : padL + ((v - rx0) / (rx1 - rx0)) * innerW;
            return (
              <g key={`xtick-${i}-${v}`}>
                <line x1={x} y1={padT + innerH} x2={x} y2={padT + innerH + 6} stroke={axisColor} strokeWidth={1} />
                <text x={x} y={padT + innerH + 18} textAnchor="middle" fontSize={axisFontSize} fill={axisColor} style={{ fontFamily }}>
                  {v}
                </text>
              </g>
            );
          })}

          {/* Y ticks */}
          {yTickVals.map((v, i) => {
            const y = yToPx(v);
            return (
              <g key={`ytick-${i}-${v}`}>
                <line x1={padL - 6} y1={y} x2={padL} y2={y} stroke={axisColor} strokeWidth={1} />
                <text x={padL - 8} y={y + 3} textAnchor="end" fontSize={axisFontSize} fill={axisColor} style={{ fontFamily }}>
                  {v}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {bins.map((b, i) => {
            const x0 = xToPx(b.start);
            const x1 = xToPx(b.end);
            const w = Math.max(1, Math.abs(x1 - x0));
            const y = yToPx(b.count);
            const h = Math.max(0, padT + innerH - 2 - y); // 2px headroom
            const fill = i === userBinIndex ? highlightBarColor : barColor;
            return (
              <g key={`${b.start}-${b.end}`}>
                <rect
                  x={Math.min(x0, x1)}
                  y={y}
                  width={w}
                  height={h}
                  fill={fill}
                  rx={2}
                  ry={2}
                  onMouseEnter={() => setHoverI(i)}
                  onMouseMove={() => setHoverI(i)}
                  onMouseLeave={() => setHoverI(-1)}
                />
                {showLabels && h > 16 && (
                  <text x={Math.min(x0, x1) + w / 2} y={y - 4} textAnchor="middle" fontSize={10} fill="#cbd5e1" style={{ fontFamily }}>
                    {fmtNum(b.count)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Current rating marker */}
          {markerX !== null && (
            <>
              <line x1={markerX} y1={padT - 2} x2={markerX} y2={padT + innerH + 2} stroke={markerColor} strokeDasharray="4 3" strokeWidth={2} />
              <text x={markerX} y={padT - 6} textAnchor="middle" fontSize={markerFontSize} fill={markerColor} style={{ fontFamily }}>
                {Math.round(rating)}
              </text>
            </>
          )}
        </svg>

        {/* Empty-state */}
        {empty && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-zinc-900/90 px-3 py-1 text-[12px] text-zinc-400 ring-1 ring-zinc-700" style={{ fontFamily }}>
            No distribution data available
          </div>
        )}

        {/* Hover tooltip */}
        {hoverBin && (
          <div
            className="pointer-events-none absolute rounded-md bg-zinc-900/95 px-2 py-1 text-[11px] text-zinc-200 ring-1 ring-zinc-700"
            style={{
              left: `${(xToPx((hoverBin.start + hoverBin.end) / 2) / width) * 100}%`,
              top: `${(yToPx(hoverBin.count) / height) * 100}%`,
              transform: "translate(-50%, -110%)",
              fontFamily,
            }}
          >
            <div className="font-medium">
              {fmtRange(
                normalized ? ratingRange[0] + hoverBin.start * (ratingRange[1] - ratingRange[0]) : hoverBin.start,
                normalized ? ratingRange[0] + hoverBin.end * (ratingRange[1] - ratingRange[0]) : hoverBin.end
              )}
            </div>
            <div className="text-zinc-300">{fmtNum(hoverBin.count)} users</div>
          </div>
        )}
      </div>
    </div>
  );
}
