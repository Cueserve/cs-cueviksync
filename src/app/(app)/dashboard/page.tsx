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
} from "@/lib/date-utils";
import { MetricCard } from "@/components/ui/metric-card";
import { LineChart } from "@/components/charts/line-chart";
import { BarChart } from "@/components/charts/bar-chart";

export default function DashboardPage() {
  const { jobs } = useTracker();

  // Metrics calculations
  const pendingJobs = jobs.filter((j) => !j.completedDate && j.lineNo === 1);
  const overdueCount = pendingJobs.filter((j) => {
    const promised = new Date(j.promisedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    promised.setHours(0, 0, 0, 0);
    return today > promised;
  }).length;

  const completedJobs = jobs.filter((j) => !!j.completedDate && j.lineNo === 1);
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

  const defaultWeeks = ["2026-08-03", "2026-08-10", "2026-08-17"];
  defaultWeeks.forEach((w) => {
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
            jobs.filter((j) => !!j.materialShortage && j.lineNo === 1).length
          }
          description="Awaiting material deliveries"
          icon={<Trash2 className="size-4 text-warning" />}
        />

        <MetricCard
          title="Equipment Issues"
          value={
            jobs.filter(
              (j) =>
                !!j.equipmentIssue &&
                j.equipmentIssue.toLowerCase() !== "no" &&
                j.lineNo === 1,
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
          <LineChart
            data={turnaroundData}
            color="var(--chart-1)"
            yMax={7}
            yLabels={["7", "4", "0"]}
            formatY={(v) => v.toFixed(1)}
          />
        </Card>

        {/* Chart 2: On-Time Delivery */}
        <Card padding="default" className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <TrendingUp className="size-4 text-[var(--chart-2)]" />
            On-Time Delivery %
          </h4>
          <LineChart
            data={onTimeData}
            color="var(--chart-2)"
            yMax={100}
            yLabels={["100%", "50%", "0%"]}
            formatY={(v) => `${v}%`}
          />
        </Card>

        {/* Chart 3: Jobs Completed per Week */}
        <Card padding="default" className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold flex items-center gap-1.5 text-foreground">
            <BarChart2 className="size-4 text-[var(--chart-4)]" />
            Jobs Completed per Week
          </h4>
          <BarChart
            data={completedData}
            color="var(--chart-1)"
            yMax={maxJobsCompleted}
          />
        </Card>
      </div>

      {/* Main KPI Table (from spreadsheet/PDF) */}
      <div className="mt-8">
        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
          <BarChart2 className="size-4 text-sidebar-primary" />
          Weekly Performance Trends
        </h3>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="p-4 font-semibold">Week Ending (Mon)</th>
                <th className="p-4 font-semibold">Jobs Completed</th>
                <th className="p-4 font-semibold">Avg Turnaround (Days)</th>
                <th className="p-4 font-semibold">On-Time Delivery %</th>
                <th className="p-4 font-semibold">Total Invoice Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-mono">
              {weeklyStatsArray.map((stat) => {
                const avgTurnaround =
                  stat.completedCount > 0
                    ? (stat.totalTurnaround / stat.completedCount).toFixed(1)
                    : "-";
                const onTimePercent =
                  stat.completedCount > 0
                    ? `${Math.round((stat.onTimeCount / stat.completedCount) * 100)}%`
                    : "-";

                return (
                  <tr
                    key={stat.weekEnding}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="p-4 font-medium text-foreground">
                      {formatDateUS(stat.weekEnding)}
                    </td>
                    <td className="p-4">{stat.completedCount}</td>
                    <td className="p-4">{avgTurnaround}</td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4 font-semibold text-foreground">
                      ${stat.invoiceSum.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageBody>
  );
}
