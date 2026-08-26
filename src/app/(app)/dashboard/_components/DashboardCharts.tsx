import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, BarChart2 } from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  turnaround: { label: "Turnaround Time", color: "var(--chart-1)" },
  onTime: { label: "On-Time %", color: "var(--chart-2)" },
  completed: { label: "Jobs Completed", color: "var(--chart-4)" },
} satisfies ChartConfig;

interface ChartDataPoint {
  label: string;
  value: number;
}

interface DashboardChartsProps {
  turnaroundData: ChartDataPoint[];
  onTimeData: ChartDataPoint[];
  completedData: ChartDataPoint[];
  maxJobsCompleted: number;
}

export function DashboardCharts({
  turnaroundData,
  onTimeData,
  completedData,
  maxJobsCompleted,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      {/* Chart 1: Avg Turnaround Time */}
      <Card padding="default" className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
          <TrendingUp className="size-4 text-[var(--chart-1)]" />
          Avg Turnaround Time (Days)
        </h4>
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full mt-2"
        >
          <LineChart
            accessibilityLayer
            data={turnaroundData}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 7]}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-turnaround)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-turnaround)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Chart 2: On-Time Delivery % */}
      <Card padding="default" className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
          <TrendingUp className="size-4 text-[var(--chart-2)]" />
          On-Time Delivery %
        </h4>
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full mt-2"
        >
          <LineChart
            accessibilityLayer
            data={onTimeData}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, 100]}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke="var(--color-onTime)"
              strokeWidth={2}
              dot={{ r: 4, fill: "var(--color-onTime)" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Chart 3: Jobs Completed per Week */}
      <Card padding="default" className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
          <BarChart2 className="size-4 text-[var(--chart-4)]" />
          Jobs Completed per Week
        </h4>
        <ChartContainer
          config={chartConfig}
          className="min-h-[200px] w-full mt-2"
        >
          <BarChart
            accessibilityLayer
            data={completedData}
            margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-muted"
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs text-muted-foreground"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, maxJobsCompleted]}
              className="text-xs text-muted-foreground"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-completed)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  );
}
