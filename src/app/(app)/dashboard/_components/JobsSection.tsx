import { Card } from "@/components/ui/card";
import { KpiStat } from "@/components/ui/kpi-stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-table";
import { formatMoney, formatPercent } from "@/lib/utils";

import { aggregateJobs, type JobsWeek } from "./sample-data";

// The one section grounded in committed scope: PRD-043's weekly job KPI
// summary (jobs completed, avg turnaround, on-time %, invoice value). The
// table stays one-row-per-week regardless of the period toggle -- only the
// tile strip above it re-aggregates. That split is PRD-043's own shape, not
// invented for this mockup.
export function JobsSection({ weeks }: { weeks: JobsWeek[] }) {
  const totals = aggregateJobs(weeks);
  const onTimeTone =
    totals.onTimePct >= 90
      ? "success"
      : totals.onTimePct >= 80
        ? "warning"
        : "destructive";

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg">Jobs</h2>

      <Card className="flex flex-wrap items-start gap-x-10 gap-y-5">
        <KpiStat label="Jobs completed" value={totals.completed} />
        <KpiStat
          label="Avg turnaround"
          value={`${totals.avgTurnaroundDays.toFixed(1)}d`}
        />
        <KpiStat
          label="On-time"
          value={formatPercent(totals.onTimePct)}
          tone={onTimeTone}
        />
        <KpiStat
          label="Invoice value"
          value={formatMoney(totals.invoiceValue)}
        />
      </Card>

      <Table caption="Jobs completed, turnaround, on-time percentage, and invoice value by week">
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Completed</TableHead>
            <TableHead>Avg turnaround</TableHead>
            <TableHead>On-time</TableHead>
            <TableHead>Invoice value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks.map((row) => (
            <TableRow key={row.week}>
              <TableCell header>{row.week}</TableCell>
              <TableCell numeric>{row.completed}</TableCell>
              <TableCell numeric>{row.avgTurnaroundDays.toFixed(1)}d</TableCell>
              <TableCell numeric>{formatPercent(row.onTimePct)}</TableCell>
              <TableCell numeric>{formatMoney(row.invoiceValue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
