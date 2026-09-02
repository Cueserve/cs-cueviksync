import React from "react";
import { Card } from "@/components/ui/card";
import { useDraggableScroll } from "@/hooks/use-draggable-scroll";
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
  const scroll1 = useDraggableScroll<HTMLDivElement>({ scrollToEnd: true });
  const scroll2 = useDraggableScroll<HTMLDivElement>({ scrollToEnd: true });
  const scroll3 = useDraggableScroll<HTMLDivElement>({ scrollToEnd: true });

  return (
    <div className="grid gap-6 md:grid-cols-3 mt-8">
      {/* Chart 1: Avg Turnaround Time */}
      <Card padding="default" className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
          <TrendingUp className="size-4 text-[var(--chart-1)]" />
          Avg Turnaround Time (Days)
        </h4>
        <div
          {...scroll1}
          className={`overflow-x-auto w-full pb-2 scrollbar-thin ${
            scroll1.isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          <div
            style={{
              minWidth: `${Math.max(turnaroundData.length * 40, 300)}px`,
            }}
          >
            <ChartContainer
              config={chartConfig}
              className="h-[250px] w-full mt-2"
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
                  padding={{ left: 20, right: 20 }}
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
          </div>
        </div>
      </Card>

      {/* Chart 2: On-Time Delivery % */}
      <Card padding="default" className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
          <TrendingUp className="size-4 text-[var(--chart-2)]" />
          On-Time Delivery %
        </h4>
        <div
          {...scroll2}
          className={`overflow-x-auto w-full pb-2 scrollbar-thin ${
            scroll2.isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          <div
            style={{
              minWidth: `${Math.max(onTimeData.length * 40, 300)}px`,
            }}
          >
            <ChartContainer
              config={chartConfig}
              className="h-[250px] w-full mt-2"
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
                  padding={{ left: 20, right: 20 }}
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
          </div>
        </div>
      </Card>

      {/* Chart 3: Jobs Completed per Week */}
      <Card padding="default" className="flex flex-col gap-3">
        <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
          <BarChart2 className="size-4 text-[var(--chart-4)]" />
          Jobs Completed per Week
        </h4>
        <div
          {...scroll3}
          className={`overflow-x-auto w-full pb-2 scrollbar-thin ${
            scroll3.isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
        >
          <div
            style={{
              minWidth: `${Math.max(completedData.length * 40, 300)}px`,
            }}
          >
            <ChartContainer
              config={chartConfig}
              className="h-[250px] w-full mt-2"
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
          </div>
        </div>
      </Card>
    </div>
  );
}
