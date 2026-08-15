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

import { aggregateSales, SALES_SNAPSHOT, type SalesWeek } from "./sample-data";

// Sales has no committed KPI surface yet (PRODUCT.md §4: pipeline/performance
// reporting is post-thin-core roadmap, and there is no Opportunity data
// model in this repo to source it from). This mockup argues for one, built
// from the activity-focused metrics confirmed in the shape brief rather than
// funnel numbers the app can't produce today.
export function SalesSection({ weeks }: { weeks: SalesWeek[] }) {
  const totals = aggregateSales(weeks);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg">Sales</h2>
        <span className="text-xs text-muted-foreground">
          Concept only — no Opportunity data model yet
        </span>
      </div>

      <Card className="flex flex-wrap items-start gap-x-10 gap-y-5">
        <KpiStat
          label="Median first response"
          value={`${totals.medianResponseHours.toFixed(1)}h`}
        />
        <KpiStat label="Quotes sent" value={totals.quotesSent} />
        <KpiStat
          label="Follow-ups overdue (today)"
          value={SALES_SNAPSHOT.followUpsOverdue}
          tone={SALES_SNAPSHOT.followUpsOverdue > 0 ? "warning" : "success"}
        />
        <KpiStat
          label="Deals with no next action (today)"
          value={SALES_SNAPSHOT.dealsWithNoNextAction}
          tone={
            SALES_SNAPSHOT.dealsWithNoNextAction > 0 ? "destructive" : "success"
          }
        />
      </Card>

      <Table caption="Median first-response time and quotes sent by week">
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Median first response</TableHead>
            <TableHead>Quotes sent</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks.map((row) => (
            <TableRow key={row.week}>
              <TableCell header>{row.week}</TableCell>
              <TableCell numeric>
                {row.medianResponseHours.toFixed(1)}h
              </TableCell>
              <TableCell numeric>{row.quotesSent}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
