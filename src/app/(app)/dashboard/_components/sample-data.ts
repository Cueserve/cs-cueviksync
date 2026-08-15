// Hardcoded, deterministic sample data -- not a fixture layer to delete later.
// Sales and Finance have no real data model yet (PRODUCT.md §4: Sales
// reporting is post-thin-core roadmap; Finance/accounting is permanently
// out of scope). This route is a pitch mockup for a future PRD, not a
// preview of a screen that is about to be wired up. Jobs numbers are shaped
// to match the one KPI surface that IS committed, PRD-043's weekly job
// summary table.
//
// Static arrays, not Math.random(): this file is imported by a "use client"
// component, and a value that differs between the server render and the
// client hydration pass would throw a hydration mismatch.

/** Most recent week first. 13 weeks = one quarter. */
export const WEEKS = [
  "Aug 10",
  "Aug 3",
  "Jul 27",
  "Jul 20",
  "Jul 13",
  "Jul 6",
  "Jun 29",
  "Jun 22",
  "Jun 15",
  "Jun 8",
  "Jun 1",
  "May 25",
  "May 18",
] as const;

export interface JobsWeek {
  week: string;
  completed: number;
  avgTurnaroundDays: number;
  onTimePct: number;
  invoiceValue: number;
}

// PRD-043: jobs completed, average turnaround, on-time %, total invoice
// value -- one row per week. invoiceValue is also what Finance's
// "Invoiced" column reads from below; Jobs is the source of that number.
export const JOBS_WEEKS: JobsWeek[] = [
  {
    week: WEEKS[0],
    completed: 27,
    avgTurnaroundDays: 2.4,
    onTimePct: 93,
    invoiceValue: 31200,
  },
  {
    week: WEEKS[1],
    completed: 24,
    avgTurnaroundDays: 2.7,
    onTimePct: 89,
    invoiceValue: 28650,
  },
  {
    week: WEEKS[2],
    completed: 29,
    avgTurnaroundDays: 2.2,
    onTimePct: 95,
    invoiceValue: 33800,
  },
  {
    week: WEEKS[3],
    completed: 22,
    avgTurnaroundDays: 3.1,
    onTimePct: 84,
    invoiceValue: 25100,
  },
  {
    week: WEEKS[4],
    completed: 26,
    avgTurnaroundDays: 2.5,
    onTimePct: 91,
    invoiceValue: 29700,
  },
  {
    week: WEEKS[5],
    completed: 19,
    avgTurnaroundDays: 3.4,
    onTimePct: 79,
    invoiceValue: 21400,
  },
  {
    week: WEEKS[6],
    completed: 25,
    avgTurnaroundDays: 2.6,
    onTimePct: 90,
    invoiceValue: 27950,
  },
  {
    week: WEEKS[7],
    completed: 23,
    avgTurnaroundDays: 2.9,
    onTimePct: 87,
    invoiceValue: 26300,
  },
  {
    week: WEEKS[8],
    completed: 28,
    avgTurnaroundDays: 2.3,
    onTimePct: 94,
    invoiceValue: 32100,
  },
  {
    week: WEEKS[9],
    completed: 21,
    avgTurnaroundDays: 3.0,
    onTimePct: 85,
    invoiceValue: 24000,
  },
  {
    week: WEEKS[10],
    completed: 24,
    avgTurnaroundDays: 2.8,
    onTimePct: 88,
    invoiceValue: 27100,
  },
  {
    week: WEEKS[11],
    completed: 20,
    avgTurnaroundDays: 3.2,
    onTimePct: 82,
    invoiceValue: 22800,
  },
  {
    week: WEEKS[12],
    completed: 26,
    avgTurnaroundDays: 2.5,
    onTimePct: 92,
    invoiceValue: 29400,
  },
];

export interface SalesWeek {
  week: string;
  medianResponseHours: number;
  quotesSent: number;
}

// Activity-focused set (per confirmed brief), not funnel/pipeline metrics --
// there is no Opportunity data model yet to source those from.
export const SALES_WEEKS: SalesWeek[] = [
  { week: WEEKS[0], medianResponseHours: 1.4, quotesSent: 19 },
  { week: WEEKS[1], medianResponseHours: 1.8, quotesSent: 15 },
  { week: WEEKS[2], medianResponseHours: 1.1, quotesSent: 22 },
  { week: WEEKS[3], medianResponseHours: 2.3, quotesSent: 12 },
  { week: WEEKS[4], medianResponseHours: 1.6, quotesSent: 18 },
  { week: WEEKS[5], medianResponseHours: 2.8, quotesSent: 9 },
  { week: WEEKS[6], medianResponseHours: 1.5, quotesSent: 17 },
  { week: WEEKS[7], medianResponseHours: 1.9, quotesSent: 14 },
  { week: WEEKS[8], medianResponseHours: 1.2, quotesSent: 21 },
  { week: WEEKS[9], medianResponseHours: 2.5, quotesSent: 11 },
  { week: WEEKS[10], medianResponseHours: 1.7, quotesSent: 16 },
  { week: WEEKS[11], medianResponseHours: 2.6, quotesSent: 10 },
  { week: WEEKS[12], medianResponseHours: 1.4, quotesSent: 18 },
];

// Point-in-time, not period data: how many deals sit in a bad state right
// now. Doesn't re-aggregate with the period toggle -- there's only one
// "now". followUpsOverdue and dealsWithNoNextAction both trace to the
// PRODUCT.md §5 pipeline-visibility success criterion ("zero deals with no
// owner or next step"), the one committed Sales-adjacent number this mockup
// can point to.
export const SALES_SNAPSHOT = {
  followUpsOverdue: 6,
  dealsWithNoNextAction: 3,
};

export interface FinanceWeek {
  week: string;
  quotedValue: number;
  wonValue: number;
  invoicedValue: number;
}

// invoicedValue mirrors JOBS_WEEKS.invoiceValue exactly -- Finance is framed
// as a revenue lens on Sales+Jobs data (per confirmed brief), not a new
// accounting concept.
export const FINANCE_WEEKS: FinanceWeek[] = [
  { week: WEEKS[0], quotedValue: 42100, wonValue: 33700, invoicedValue: 31200 },
  { week: WEEKS[1], quotedValue: 38700, wonValue: 30900, invoicedValue: 28650 },
  { week: WEEKS[2], quotedValue: 45600, wonValue: 36500, invoicedValue: 33800 },
  { week: WEEKS[3], quotedValue: 33900, wonValue: 27100, invoicedValue: 25100 },
  { week: WEEKS[4], quotedValue: 40100, wonValue: 32100, invoicedValue: 29700 },
  { week: WEEKS[5], quotedValue: 28900, wonValue: 23100, invoicedValue: 21400 },
  { week: WEEKS[6], quotedValue: 37700, wonValue: 30200, invoicedValue: 27950 },
  { week: WEEKS[7], quotedValue: 35500, wonValue: 28400, invoicedValue: 26300 },
  { week: WEEKS[8], quotedValue: 43300, wonValue: 34700, invoicedValue: 32100 },
  { week: WEEKS[9], quotedValue: 32400, wonValue: 25900, invoicedValue: 24000 },
  {
    week: WEEKS[10],
    quotedValue: 36600,
    wonValue: 29300,
    invoicedValue: 27100,
  },
  {
    week: WEEKS[11],
    quotedValue: 30800,
    wonValue: 24600,
    invoicedValue: 22800,
  },
  {
    week: WEEKS[12],
    quotedValue: 39700,
    wonValue: 31800,
    invoicedValue: 29400,
  },
];

export type Period = "weekly" | "monthly" | "quarterly";

export const PERIOD_LABEL: Record<Period, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

/** How many of the most recent weekly rows a period covers. */
const PERIOD_WEEK_COUNT: Record<Period, number> = {
  weekly: 1,
  monthly: 4,
  quarterly: 13,
};

export function weeksForPeriod<T>(rows: readonly T[], period: Period): T[] {
  return rows.slice(0, PERIOD_WEEK_COUNT[period]);
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function average(values: number[]) {
  return sum(values) / values.length;
}

export function aggregateJobs(rows: JobsWeek[]) {
  return {
    completed: sum(rows.map((row) => row.completed)),
    avgTurnaroundDays: average(rows.map((row) => row.avgTurnaroundDays)),
    onTimePct: average(rows.map((row) => row.onTimePct)),
    invoiceValue: sum(rows.map((row) => row.invoiceValue)),
  };
}

export function aggregateSales(rows: SalesWeek[]) {
  return {
    medianResponseHours: average(rows.map((row) => row.medianResponseHours)),
    quotesSent: sum(rows.map((row) => row.quotesSent)),
  };
}

export function aggregateFinance(rows: FinanceWeek[]) {
  return {
    quotedValue: sum(rows.map((row) => row.quotedValue)),
    wonValue: sum(rows.map((row) => row.wonValue)),
    invoicedValue: sum(rows.map((row) => row.invoicedValue)),
  };
}
