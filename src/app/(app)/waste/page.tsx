import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth";
import WasteClient from "./_components/WasteClient";
import type { Database } from "@/lib/supabase/types";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type JobLineItemRow = Database["public"]["Tables"]["job_line_items"]["Row"];

export type JobWithItems = JobRow & {
  items: JobLineItemRow[];
};

interface WastePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function WasteReworkPage({
  searchParams,
}: WastePageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. User Role (memoized across layout & page)
  const userRole = await getCurrentUserRole();

  // 2. Parse search parameters
  const pageParam = typeof params.page === "string" ? params.page : "1";
  const sizeParam = typeof params.size === "string" ? params.size : "25";
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const sortBy =
    typeof params.sortBy === "string" ? params.sortBy : "orderDate";
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : "desc";

  // 3. Fast KPI stats queries
  const [
    { count: reprintCount },
    { count: totalActiveJobs },
    { data: spoilageRows },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .eq("reprintRequired", true),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("jobs")
      .select("spoilagePercent")
      .is("deleted_at", null)
      .gt("spoilagePercent", 0),
  ]);

  const totalSpoilageSum = (spoilageRows || []).reduce(
    (sum, r) => sum + Number(r.spoilagePercent || 0),
    0,
  );
  const avgSpoilage =
    totalActiveJobs && totalActiveJobs > 0
      ? (totalSpoilageSum / totalActiveJobs).toFixed(2)
      : "0.00";

  // 4. Build Waste Query (spoilagePercent > 0 OR reprintRequired = true)
  let query = supabase
    .from("jobs")
    .select("*, items:job_line_items(*)", { count: "exact" })
    .is("deleted_at", null)
    .or("spoilagePercent.gt.0,reprintRequired.eq.true");

  if (search) {
    const { data: matchingItems } = await supabase
      .from("job_line_items")
      .select("job_id")
      .ilike("itemDescription", `%${search}%`);

    const matchingJobIds = Array.from(
      new Set((matchingItems || []).map((i) => i.job_id)),
    );

    if (matchingJobIds.length > 0) {
      query = query.or(
        `jobNo.ilike.%${search}%,id.in.(${matchingJobIds.join(",")})`,
      );
    } else {
      query = query.ilike("jobNo", `%${search}%`);
    }
  }

  // Sorting
  const directSortColumns = [
    "jobNo",
    "spoilagePercent",
    "reprintRequired",
    "orderDate",
    "created_at",
  ];
  const sortColumn = directSortColumns.includes(sortBy) ? sortBy : "orderDate";
  query = query.order(sortColumn, { ascending: sortDir === "asc" });

  // Pagination
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.max(1, parseInt(sizeParam, 10) || 25);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const [
    { data: wasteJobs, count: filteredTotalCount, error },
    { data: allActiveJobs },
  ] = await Promise.all([
    query,
    // For WasteDialog dropdown to select any active job
    supabase
      .from("jobs")
      .select("*, items:job_line_items(*)")
      .is("deleted_at", null)
      .order("jobNo", { ascending: true }),
  ]);

  if (error) {
    console.error("Error fetching waste log:", error);
    return (
      <div className="p-8 text-destructive">
        Error loading waste log: {error.message}
      </div>
    );
  }

  return (
    <WasteClient
      jobs={(wasteJobs || []) as unknown as JobWithItems[]}
      allJobsForDialog={(allActiveJobs || []) as unknown as JobWithItems[]}
      userRole={userRole}
      totalCount={filteredTotalCount ?? 0}
      currentPage={currentPage}
      pageSize={pageSize}
      avgSpoilage={avgSpoilage}
      reprintCount={reprintCount ?? 0}
    />
  );
}
