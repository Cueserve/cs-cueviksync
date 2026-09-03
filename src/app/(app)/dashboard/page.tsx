import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./_components/DashboardClient";
import type { JobWithItems } from "@/app/(app)/jobs/_components/JobsDashboardClient";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const yearParam =
    typeof params.year === "string" ? parseInt(params.year, 10) : currentYear;
  const selectedYear = !isNaN(yearParam) ? yearParam : currentYear;

  const supabase = await createClient();

  // 1. Fetch dates for available years list, active pending workload, and completed jobs for selected year in parallel
  const [
    { data: yearDates },
    { data: pendingJobs, error: pendingErr },
    { data: completedYearJobs, error: completedErr },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("orderDate, completedDate")
      .is("deleted_at", null),
    supabase
      .from("jobs")
      .select("*, items:job_line_items(*)")
      .is("deleted_at", null)
      .is("completedDate", null),
    supabase
      .from("jobs")
      .select("*, items:job_line_items(*)")
      .is("deleted_at", null)
      .gte("completedDate", `${selectedYear}-01-01`)
      .lte("completedDate", `${selectedYear}-12-31`),
  ]);

  if (pendingErr || completedErr) {
    console.error("Error loading dashboard data:", pendingErr || completedErr);
    return (
      <div className="p-8 text-destructive">
        Error loading dashboard data: {(pendingErr || completedErr)?.message}
      </div>
    );
  }

  // Calculate available years
  const yearsSet = new Set<number>();
  yearsSet.add(currentYear);
  yearsSet.add(selectedYear);
  (yearDates || []).forEach((row) => {
    if (row.completedDate) {
      const y = parseInt(row.completedDate.substring(0, 4), 10);
      if (!isNaN(y)) yearsSet.add(y);
    }
    if (row.orderDate) {
      const y = parseInt(row.orderDate.substring(0, 4), 10);
      if (!isNaN(y)) yearsSet.add(y);
    }
  });
  const availableYears = Array.from(yearsSet).sort((a, b) => b - a);

  // Combine pending workload + completed jobs for selected year
  const relevantJobs = [
    ...(pendingJobs || []),
    ...(completedYearJobs || []),
  ] as unknown as JobWithItems[];

  return (
    <DashboardClient
      jobs={relevantJobs}
      initialYear={selectedYear}
      availableYears={availableYears}
    />
  );
}
