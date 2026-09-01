import { createClient } from "@/lib/supabase/server";
import JobDetailsClient from "./_components/JobDetailsClient";
import type { JobWithItems } from "@/app/(app)/jobs/_components/JobsDashboardClient";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: jobData }, { data: allJobsData }, { data: roleData }] =
    await Promise.all([
      id === "new"
        ? Promise.resolve({ data: null })
        : supabase
            .from("jobs")
            .select("*, items:job_line_items(*)")
            .eq("jobNo", id)
            .limit(1)
            .maybeSingle(),
      supabase
        .from("jobs")
        .select("*, items:job_line_items(*)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase.rpc("get_user_role"),
    ]);

  const initialJob = jobData as unknown as JobWithItems | null;
  const allJobs = (allJobsData || []) as unknown as JobWithItems[];
  const userRole = roleData || "viewer";

  const isArchived = initialJob?.deleted_at != null;
  const canEdit =
    !isArchived &&
    (userRole === "owner_admin" ||
      userRole === "sales_manager" ||
      userRole === "office_admin");

  return (
    <JobDetailsClient
      initialJob={initialJob}
      allJobs={allJobs}
      canEdit={canEdit}
      isNewRoute={id === "new"}
    />
  );
}
