"use client";

import React from "react";
import {
  CheckCircle2,
  Layers,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { useTracker } from "@/components/providers/tracker-provider";
import { MetricCard } from "@/components/ui/metric-card";
import { formatMoney } from "@/lib/utils";
import { useJobMetrics } from "@/hooks/use-job-metrics";
import { DashboardCharts } from "./_components/DashboardCharts";
import { WeeklyPerformanceTable } from "./_components/WeeklyPerformanceTable";

export default function DashboardPage() {
  const { jobs } = useTracker();

  const {
    pendingJobs,
    overdueCount,
    completedJobs,
    totalInvoice,
    shortagesFlaggedCount,
    equipmentIssuesCount,
    weeklyStatsArray,
    chartData,
  } = useJobMetrics(jobs);

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
