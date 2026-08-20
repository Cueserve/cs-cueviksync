"use client";

import React from "react";
import {
  CheckCircle2,
  Layers,
  Trash2,
  AlertCircle,
  RefreshCw,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { useTracker } from "@/components/providers/tracker-provider";
import { Card } from "@/components/ui/card";
import {
  getWeekEndingMonday,
  getTurnaroundDays,
  isOnTime,
  formatDateUS,
  parseLocalDate,
} from "@/lib/date-utils";
import { MetricCard } from "@/components/ui/metric-card";
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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useSort, SortConfig } from "@/hooks/use-sort";

export default function DashboardPage() {
  const { jobs } = useTracker();

  // Metrics calculations
  const pendingJobs = jobs.filter((j) => !j.completedDate);
  const overdueCount = pendingJobs.filter((j) => {
    const promised = new Date(j.promisedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    promised.setHours(0, 0, 0, 0);
    return today > promised;
  }).length;

  const completedJobs = jobs.filter((j) => !!j.completedDate);
  const totalInvoice = completedJobs.reduce(
    (sum, j) => sum + j.invoiceValue,
    0,
  );

  // Group completed jobs by Week Ending Monday
  const weeklyGroups: Record<
    string,
    {
      weekEnding: string;
      completedCount: number;
      totalTurnaround: number;
      onTimeCount: number;
      invoiceSum: number;
    }
  > = {};

  const jobWeeks = completedJobs
    .map((job) => getWeekEndingMonday(job.completedDate))
    .filter(Boolean) as string[];

  const allDates = [...jobWeeks, "2026-08-03", "2026-08-10", "2026-08-17"];
  const minDateStr = allDates.reduce(
    (min, w) => (w < min ? w : min),
    allDates[0],
  );
  const maxDateStr = allDates.reduce(
    (max, w) => (w > max ? w : max),
    allDates[0],
  );

  const current = parseLocalDate(minDateStr);
  const end = parseLocalDate(maxDateStr);

  const generatedWeeks: string[] = [];
  while (current <= end) {
    const yy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    generatedWeeks.push(`${yy}-${mm}-${dd}`);
    current.setDate(current.getDate() + 7);
  }

  generatedWeeks.forEach((w) => {
    weeklyGroups[w] = {
      weekEnding: w,
      completedCount: 0,
      totalTurnaround: 0,
      onTimeCount: 0,
      invoiceSum: 0,
    };
  });

  completedJobs.forEach((job) => {
    const week = getWeekEndingMonday(job.completedDate);
    if (!week) return;

    if (!weeklyGroups[week]) {
      weeklyGroups[week] = {
        weekEnding: week,
        completedCount: 0,
        totalTurnaround: 0,
        onTimeCount: 0,
        invoiceSum: 0,
      };
    }

    const group = weeklyGroups[week];
    group.completedCount += 1;
    group.totalTurnaround += getTurnaroundDays(
      job.orderDate,
      job.completedDate,
    );
    if (isOnTime(job.promisedDate, job.deliveredDate)) {
      group.onTimeCount += 1;
    }
    group.invoiceSum += job.invoiceValue;
  });

  const weeklyStatsArray = Object.values(weeklyGroups).sort((a, b) =>
    a.weekEnding.localeCompare(b.weekEnding),
  );

  const sortConfigs: SortConfig<(typeof weeklyStatsArray)[0]>[] = [
    {
      key: "weekEnding",
      getValue: (item) => new Date(item.weekEnding).getTime(),
    },
    { key: "completedCount", getValue: (item) => item.completedCount },
    {
      key: "avgTurnaround",
      getValue: (item) =>
        item.completedCount > 0
          ? item.totalTurnaround / item.completedCount
          : 0,
    },
    {
      key: "onTimePercent",
      getValue: (item) =>
        item.completedCount > 0 ? item.onTimeCount / item.completedCount : 0,
    },
    { key: "invoiceSum", getValue: (item) => item.invoiceSum },
  ];

  const { sortKey, sortDirection, onSort, sortedData } = useSort(
    weeklyStatsArray,
    sortConfigs,
    "weekEnding", // Default sort
    "desc",
  );

  const {
    page,
    size,
    onPageChange,
    onSizeChange,
    pageCount,
    paginatedData: paginatedStats,
  } = usePagination(sortedData, 25);

  // --- Chart Data ---
  const weekLabel = (w: string) => w.substring(5); // "08-03" etc.

  const turnaroundData = weeklyStatsArray.map((stat) => ({
    label: weekLabel(stat.weekEnding),
    value:
      stat.completedCount > 0
        ? Math.round((stat.totalTurnaround / stat.completedCount) * 10) / 10
        : 0,
  }));

  const onTimeData = weeklyStatsArray.map((stat) => ({
    label: weekLabel(stat.weekEnding),
    value:
      stat.completedCount > 0
        ? Math.round((stat.onTimeCount / stat.completedCount) * 100)
        : 0,
  }));

  const completedData = weeklyStatsArray.map((stat) => ({
    label: weekLabel(stat.weekEnding),
    value: stat.completedCount,
  }));

  const maxJobsCompleted = Math.max(...completedData.map((d) => d.value), 5);

  return (
    <PageBody>
      <div className="flex items-center justify-between">
        <PageHeader
          title="PrintWorks — Weekly KPI Dashboard"
          description="Formulas pull dynamically from Completed Jobs. Add new week data in Job Master."
        />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mt-6">
        <MetricCard
          title="Total Invoiced"
          value={`$${totalInvoice.toLocaleString()}`}
          description={`From ${completedJobs.length} completed items`}
          icon={<CheckCircle2 className="size-4 text-success" />}
        />

        <MetricCard
          title="Active Workload"
          value={pendingJobs.length}
          description="Jobs currently in production"
          icon={<Layers className="size-4 text-sidebar-primary" />}
        />

        <MetricCard
          title="Overdue Jobs"
          value={overdueCount}
          description="Jobs past promised date"
          icon={<AlertCircle className="size-4 text-destructive" />}
          valueClassName={overdueCount > 0 ? "text-destructive font-bold" : ""}
        />

        <MetricCard
          title="Shortages Flagged"
          value={
            jobs.filter((j) =>
              j.items.some(
                (i) =>
                  !!i.materialShortage &&
                  i.materialShortage.toLowerCase() !== "no",
              ),
            ).length
          }
          description="Awaiting material deliveries"
          icon={<Trash2 className="size-4 text-warning" />}
        />

        <MetricCard
          title="Equipment Issues"
          value={
            jobs.filter((j) =>
              j.items.some(
                (i) =>
                  !!i.equipmentIssue && i.equipmentIssue.toLowerCase() !== "no",
              ),
            ).length
          }
          description="Machine repairs / alerts"
          icon={<RefreshCw className="size-4 text-destructive" />}
        />
      </div>

      {/* Charts Grid */}
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

        {/* Chart 2: On-Time Delivery */}
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

      {/* Main KPI Table (from spreadsheet/PDF) */}
      <div className="mt-8">
        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="size-4 text-sidebar-primary" />
          Weekly Performance Trends
        </h3>
        <div className="bg-card rounded-md mt-4">
          <Table caption="Weekly Performance Trends">
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  className="text-center"
                  sortKey="weekEnding"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                >
                  Week Ending (Mon)
                </SortableTableHead>
                <SortableTableHead
                  className="text-center"
                  sortKey="completedCount"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                >
                  Jobs Completed
                </SortableTableHead>
                <SortableTableHead
                  className="text-center"
                  sortKey="avgTurnaround"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                >
                  Avg Turnaround (Days)
                </SortableTableHead>
                <SortableTableHead
                  className="text-center"
                  sortKey="onTimePercent"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                >
                  On-Time Delivery %
                </SortableTableHead>
                <SortableTableHead
                  className="text-center"
                  sortKey="invoiceSum"
                  currentSortKey={sortKey}
                  currentSortDirection={sortDirection}
                  onSort={onSort}
                >
                  Total Invoice Value
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="font-mono text-center">
              {paginatedStats.map((stat) => {
                const avgTurnaround =
                  stat.completedCount > 0
                    ? (stat.totalTurnaround / stat.completedCount).toFixed(1)
                    : "-";
                const onTimePercent =
                  stat.completedCount > 0
                    ? `${Math.round((stat.onTimeCount / stat.completedCount) * 100)}%`
                    : "-";

                return (
                  <TableRow key={stat.weekEnding}>
                    <TableCell className="font-medium text-foreground">
                      {formatDateUS(stat.weekEnding)}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.completedCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {avgTurnaround}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.completedCount > 0 && (
                        <span
                          className={
                            stat.onTimeCount / stat.completedCount >= 0.7
                              ? "text-success font-semibold"
                              : "text-destructive font-semibold"
                          }
                        >
                          {onTimePercent}
                        </span>
                      )}
                      {stat.completedCount === 0 && "-"}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-center">
                      ${stat.invoiceSum.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {weeklyStatsArray.length > 0 && (
            <div className="mt-4 px-2 pb-4">
              <Pagination
                page={page}
                pageCount={pageCount}
                size={size}
                onPageChange={onPageChange}
                onSizeChange={onSizeChange}
              />
            </div>
          )}
        </div>
      </div>
    </PageBody>
  );
}
