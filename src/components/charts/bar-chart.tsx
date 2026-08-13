/**
 * BarChart — a self-contained SVG bar chart.
 *
 * Props:
 *   data    – array of { label, value } points
 *   color   – CSS variable or hex colour for the bars
 *   yMax    – optional explicit y-axis ceiling (defaults to max value)
 */

import * as React from "react";

export interface BarChartPoint {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartPoint[];
  color?: string;
  yMax?: number;
}

const W = 400;
const H = 240;
const PX = 52; // horizontal padding for y-axis labels
const PT = 36; // top padding for value labels above bars
const PB = 28; // bottom padding for x-axis labels

export function BarChart({
  data,
  color = "var(--chart-1)",
  yMax,
}: BarChartProps) {
  const gW = W - PX * 2;
  const gH = H - PT - PB;
  const baseline = PT + gH;

  const ceiling = yMax ?? Math.max(...data.map((d) => d.value), 1);

  // For bars: divide the plot area into equal sections, center each bar inside its section.
  // This prevents the first/last bar from bleeding past the y-axis or right edge.
  const sectionW = gW / data.length;
  const xOf = (i: number) => PX + sectionW * i + sectionW / 2;

  const barW = Math.min(40, sectionW * 0.55);

  return (
    <div
      className="relative w-full"
      style={{ paddingTop: `${(H / W) * 100}%` }}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        {/* Axes */}
        <line
          x1={PX}
          y1={PT}
          x2={PX}
          y2={baseline}
          stroke="var(--border)"
          strokeWidth="1.5"
        />
        <line
          x1={PX}
          y1={baseline}
          x2={W - PX}
          y2={baseline}
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Grid lines */}
        <line
          x1={PX}
          y1={PT}
          x2={W - PX}
          y2={PT}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />
        <line
          x1={PX}
          y1={PT + gH / 2}
          x2={W - PX}
          y2={PT + gH / 2}
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="4 3"
        />

        {/* Y-axis labels */}
        <text
          x={PX - 6}
          y={PT + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--muted-foreground)"
        >
          {ceiling}
        </text>
        <text
          x={PX - 6}
          y={PT + gH / 2 + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--muted-foreground)"
        >
          {Math.round(ceiling / 2)}
        </text>
        <text
          x={PX - 6}
          y={baseline + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--muted-foreground)"
        >
          0
        </text>

        {/* Bars + value labels */}
        {data.map((d, i) => {
          const cx = xOf(i);
          const bh = (d.value / ceiling) * gH;
          const by = baseline - bh;
          return (
            <g key={i}>
              {d.value > 0 && (
                <rect
                  x={cx - barW / 2}
                  y={by}
                  width={barW}
                  height={bh}
                  fill={color}
                  rx="3"
                  opacity="0.85"
                  className="hover:opacity-100 transition-opacity cursor-pointer"
                />
              )}
              {d.value > 0 && (
                <text
                  x={cx}
                  y={by - 8}
                  textAnchor="middle"
                  fontSize="13"
                  fontWeight="700"
                  fill="var(--foreground)"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={xOf(i)}
            y={baseline + 18}
            textAnchor="middle"
            fontSize="12"
            fill="var(--muted-foreground)"
          >
            {d.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
