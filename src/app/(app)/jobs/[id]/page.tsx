import { createClient } from "@/lib/supabase/server";
import { JobHistoryEntry } from "./_components/JobHistorySection";
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

  // Fetch job history and map profiles
  let jobHistory: JobHistoryEntry[] = [];
  if (initialJob?.id) {
    const { data: historyData } = await supabase
      .from("job_history")
      .select("*")
      .eq("job_id", initialJob.id)
      .order("created_at", { ascending: false });

    if (historyData && historyData.length > 0) {
      const userIds = Array.from(
        new Set(historyData.map((h) => h.user_id).filter(Boolean)),
      ) as string[];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        const profileMap = (profiles || []).reduce(
          (acc, p) => {
            acc[p.id] = p.full_name;
            return acc;
          },
          {} as Record<string, string>,
        );

        jobHistory = historyData.map((h) => ({
          ...h,
          user: {
            full_name: (h.user_id && profileMap[h.user_id]) || "Unknown User",
          },
        }));
      } else {
        jobHistory = historyData.map((h) => ({
          ...h,
          user: { full_name: "Unknown User" },
        }));
      }
    }
  }

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
      jobHistory={jobHistory}
      canEdit={canEdit}
      isNewRoute={id === "new"}
    />
  );
}
