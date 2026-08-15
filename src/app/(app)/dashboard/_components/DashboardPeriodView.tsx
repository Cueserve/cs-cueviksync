"use client";

import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { FinanceSection } from "./FinanceSection";
import { JobsSection } from "./JobsSection";
import {
  FINANCE_WEEKS,
  JOBS_WEEKS,
  PERIOD_LABEL,
  SALES_WEEKS,
  weeksForPeriod,
  type Period,
} from "./sample-data";
import { SalesSection } from "./SalesSection";

const PERIODS: Period[] = ["weekly", "monthly", "quarterly"];

// The only client boundary on this route: everything else (page.tsx, the
// three sections) is a Server Component. State lives here because the
// period toggle is the one genuinely interactive piece (DESIGN-SYSTEM.md
// §Layout: "familiar patterns are features" -- Tabs, not a custom control).
export function DashboardPeriodView() {
  const [period, setPeriod] = React.useState<Period>("weekly");

  return (
    <div className="flex flex-col gap-8">
      <Tabs
        value={period}
        onValueChange={(value) => setPeriod(value as Period)}
      >
        <TabsList>
          {PERIODS.map((value) => (
            <TabsTrigger key={value} value={value}>
              {PERIOD_LABEL[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <SalesSection weeks={weeksForPeriod(SALES_WEEKS, period)} />
      <JobsSection weeks={weeksForPeriod(JOBS_WEEKS, period)} />
      <FinanceSection weeks={weeksForPeriod(FINANCE_WEEKS, period)} />
    </div>
  );
}
