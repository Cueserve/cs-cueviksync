import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole, canEditJobs } from "@/lib/auth";
import { JobHistoryEntry } from "./_components/JobHistorySection";
import JobDetailsClient from "./_components/JobDetailsClient";
import type { JobWithItems } from "@/lib/types/jobs";

export default async function JobDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: jobData }, userRole] = await Promise.all([
    id === "new"
      ? Promise.resolve({ data: null })
      : supabase
          .from("jobs")
          .select("*, items:job_line_items(*)")
          .eq("jobNo", id)
          .limit(1)
          .maybeSingle(),
    getCurrentUserRole(),
  ]);

  const initialJob = jobData as unknown as JobWithItems | null;

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
          changes: h.changes as Record<string, unknown> | null,
          user: {
            full_name: (h.user_id && profileMap[h.user_id]) || "Unknown User",
          },
        }));
      } else {
        jobHistory = historyData.map((h) => ({
          ...h,
          changes: h.changes as Record<string, unknown> | null,
          user: { full_name: "Unknown User" },
        }));
      }
    }
  }

  const isArchived = initialJob?.deleted_at != null;
  const canEdit = !isArchived && canEditJobs(userRole);

  return (
    <JobDetailsClient
      initialJob={initialJob}
      jobHistory={jobHistory}
      canEdit={canEdit}
      isNewRoute={id === "new"}
    />
  );
}
