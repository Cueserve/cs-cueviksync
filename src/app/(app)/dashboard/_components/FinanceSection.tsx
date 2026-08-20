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
import { formatMoney } from "@/lib/utils";

import { aggregateFinance, type FinanceWeek } from "./sample-data";

// PRODUCT.md §4 permanently excludes accounting, invoicing, and payment
// processing -- CuevikSync tracks quotes and orders through acceptance and
// stops there. This section is deliberately a revenue LENS on Sales+Jobs
// data (invoicedValue mirrors JOBS_WEEKS exactly), not new accounting
// surface: no margin, no AR, no collections.
export function FinanceSection({ weeks }: { weeks: FinanceWeek[] }) {
  const totals = aggregateFinance(weeks);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg">Finance</h2>
        <span className="text-xs text-muted-foreground">
          Concept only — revenue lens on Sales + Jobs, not accounting
        </span>
      </div>

      <Card className="flex flex-wrap items-start gap-x-10 gap-y-5">
        <KpiStat label="Quoted value" value={formatMoney(totals.quotedValue)} />
        <KpiStat label="Won value" value={formatMoney(totals.wonValue)} />
        <KpiStat
          label="Invoiced value"
          value={formatMoney(totals.invoicedValue)}
        />
      </Card>

      <Table caption="Quoted, won, and invoiced value by week">
        <TableHeader>
          <TableRow>
            <TableHead>Week</TableHead>
            <TableHead>Quoted</TableHead>
            <TableHead>Won</TableHead>
            <TableHead>Invoiced</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {weeks.map((row) => (
            <TableRow key={row.week}>
              <TableCell header>{row.week}</TableCell>
              <TableCell numeric>{formatMoney(row.quotedValue)}</TableCell>
              <TableCell numeric>{formatMoney(row.wonValue)}</TableCell>
              <TableCell numeric>{formatMoney(row.invoicedValue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
}
