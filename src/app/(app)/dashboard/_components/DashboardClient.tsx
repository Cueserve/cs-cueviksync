"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  Layers,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { JobWithItems } from "@/app/(app)/jobs/_components/JobsDashboardClient";
import { MetricCard } from "@/components/ui/metric-card";
import { formatMoney } from "@/lib/utils";
import { useJobMetrics } from "@/hooks/use-job-metrics";
import { DashboardCharts } from "./DashboardCharts";
import { WeeklyPerformanceTable } from "./WeeklyPerformanceTable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardClient({ jobs }: { jobs: JobWithItems[] }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    yearsSet.add(currentYear);
    jobs.forEach((j) => {
      if (j.completedDate) {
        const y = parseInt(j.completedDate.substring(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
      if (j.orderDate) {
        const y = parseInt(j.orderDate.substring(0, 4), 10);
        if (!isNaN(y)) yearsSet.add(y);
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [jobs, currentYear]);

  const {
    pendingJobs,
    overdueCount,
    completedJobs,
    totalInvoice,
    shortagesFlaggedCount,
    equipmentIssuesCount,
    weeklyStatsArray,
    chartData,
  } = useJobMetrics(jobs, selectedYear);

  return (
    <PageBody>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="PrintWorks — Weekly KPI Dashboard"
          description="Formulas pull dynamically from Completed Jobs. Add new week data in Job Master."
        />
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Year:
          </span>
          <Select
            value={selectedYear.toString()}
            onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[110px] h-9 bg-card border-border font-medium">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent align="end">
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mt-6">
        <MetricCard
          title="Total Invoiced"
          value={formatMoney(totalInvoice)}
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
          value={shortagesFlaggedCount}
          description="Awaiting material deliveries"
          icon={<Trash2 className="size-4 text-warning" />}
        />

        <MetricCard
          title="Equipment Issues"
          value={equipmentIssuesCount}
          description="Machine repairs / alerts"
          icon={<RefreshCw className="size-4 text-destructive" />}
        />
      </div>

      <DashboardCharts
        turnaroundData={chartData.turnaroundData}
        onTimeData={chartData.onTimeData}
        completedData={chartData.completedData}
        maxJobsCompleted={chartData.maxJobsCompleted}
      />

      <WeeklyPerformanceTable weeklyStatsArray={weeklyStatsArray} />
    </PageBody>
  );
}
