import React from "react";
import { Package, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";

interface JobsMetricsSectionProps {
  kpiMetrics: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  };
}

export function JobsMetricsSection({ kpiMetrics }: JobsMetricsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mt-6">
      <MetricCard
        title="Total Jobs"
        value={kpiMetrics.total}
        icon={<Package className="size-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Pending Jobs"
        value={kpiMetrics.pending}
        icon={<Clock className="size-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Completed Jobs"
        value={kpiMetrics.completed}
        icon={<CheckCircle className="size-4 text-success" />}
      />
      <MetricCard
        title="Overdue Jobs"
        value={kpiMetrics.overdue}
        icon={<AlertTriangle className="size-4 text-destructive" />}
        valueClassName={
          kpiMetrics.overdue > 0 ? "text-destructive font-bold" : ""
        }
      />
    </div>
  );
}
