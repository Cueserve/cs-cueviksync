import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./_components/DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      `
      *,
      items:job_line_items(*)
    `,
    )
    .order("orderDate", { ascending: false });

  if (error) {
    console.error("Error fetching jobs:", error);
    return <div>Error loading dashboard data: {error.message}</div>;
  }

  return <DashboardClient jobs={jobs || []} />;
}
