/**
 * LineChart — a self-contained SVG line chart.
 *
 * Props:
 *   data       – array of { label, value } points
 *   color      – CSS variable or hex colour for the line/dots
 *   formatY    – optional formatter for the value labels (e.g. v => v + "%")
 *   yMax       – optional explicit y-axis ceiling (defaults to max value)
 *   yLabels    – optional [top, mid, bottom] override labels for y axis
 */

import * as React from "react";

export interface LineChartPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartPoint[];
  color?: string;
  formatY?: (value: number) => string;
  yMax?: number;
  yLabels?: [string, string, string];
}

const W = 400;
const H = 240;
const PX = 52; // left/right padding (room for y-axis labels)
const PT = 36; // top padding (room for value labels above dots)
const PB = 28; // bottom padding (room for x-axis labels)

export function LineChart({
  data,
  color = "var(--chart-1)",
  formatY = (v) => String(v),
  yMax,
  yLabels,
}: LineChartProps) {
  const gW = W - PX * 2;
  const gH = H - PT - PB;
  const baseline = PT + gH;

  const values = data.map((d) => d.value);
  const ceiling = yMax ?? Math.max(...values, 1);

  const xOf = (i: number) =>
    data.length <= 1 ? PX + gW / 2 : PX + (i / (data.length - 1)) * gW;

  const yOf = (val: number) => baseline - (val / ceiling) * gH;

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(d.value)}`)
    .join(" ");

  const topLabel = yLabels?.[0] ?? formatY(ceiling);
  const midLabel = yLabels?.[1] ?? formatY(Math.round(ceiling / 2));
  const botLabel = yLabels?.[2] ?? "0";

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
          {topLabel}
        </text>
        <text
          x={PX - 6}
          y={PT + gH / 2 + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--muted-foreground)"
        >
          {midLabel}
        </text>
        <text
          x={PX - 6}
          y={baseline + 4}
          textAnchor="end"
          fontSize="12"
          fill="var(--muted-foreground)"
        >
          {botLabel}
        </text>

        {/* Line */}
        {data.length > 1 && (
          <path
            d={path}
            stroke={color}
            fill="none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots + value labels */}
        {data.map((d, i) => {
          const cx = xOf(i);
          const cy = yOf(d.value);
          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="2.5"
              />
              {d.value > 0 && (
                <text
                  x={cx}
                  y={cy - 11}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill="var(--foreground)"
                >
                  {formatY(d.value)}
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
