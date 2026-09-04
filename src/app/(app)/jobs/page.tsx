import { createClient } from "@/lib/supabase/server";
import { getCurrentUserRole } from "@/lib/auth";
import JobsDashboardClient from "./_components/JobsDashboardClient";
import type { JobWithItems } from "@/lib/types/jobs";

export type { JobWithItems };

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // 1. Get user role (memoized across layout & page)
  const userRole = await getCurrentUserRole();

  // 2. Parse search parameters
  const pageParam = typeof params.page === "string" ? params.page : "1";
  const sizeParam = typeof params.size === "string" ? params.size : "25";
  const tab = typeof params.tab === "string" ? params.tab : "all";
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const sortBy =
    typeof params.sortBy === "string" ? params.sortBy : "orderDate";
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : "desc";

  // Date filters
  const orderDateFrom =
    typeof params.orderDateFrom === "string" ? params.orderDateFrom : "";
  const orderDateTo =
    typeof params.orderDateTo === "string" ? params.orderDateTo : "";
  const promisedDateFrom =
    typeof params.promisedDateFrom === "string" ? params.promisedDateFrom : "";
  const promisedDateTo =
    typeof params.promisedDateTo === "string" ? params.promisedDateTo : "";
  const completedDateFrom =
    typeof params.completedDateFrom === "string"
      ? params.completedDateFrom
      : "";
  const completedDateTo =
    typeof params.completedDateTo === "string" ? params.completedDateTo : "";
  const deliveredDateFrom =
    typeof params.deliveredDateFrom === "string"
      ? params.deliveredDateFrom
      : "";
  const deliveredDateTo =
    typeof params.deliveredDateTo === "string" ? params.deliveredDateTo : "";

  // 3. Fast KPI count queries (HEAD requests, zero row data transferred)
  const todayStr = new Date().toISOString().split("T")[0];

  const [
    { count: totalCount },
    { count: pendingCount },
    { count: completedCount },
    { count: overdueCount },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .is("completedDate", null),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .not("completedDate", "is", null),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .is("deleted_at", null)
      .is("completedDate", null)
      .lt("promisedDate", todayStr),
  ]);

  // 4. Build Paginated Filter Query
  let query = supabase
    .from("jobs")
    .select("*, items:job_line_items(*)", { count: "exact" });

  // Tab filters
  if (tab === "archived") {
    query = query.not("deleted_at", "is", null);
  } else {
    query = query.is("deleted_at", null);
    if (tab === "pending") {
      query = query.is("completedDate", null);
    } else if (tab === "completed") {
      query = query.not("completedDate", "is", null);
    } else if (tab === "this-week") {
      query = query.eq("inThisWeek", true);
    }
  }

  // Date filters
  if (orderDateFrom) query = query.gte("orderDate", orderDateFrom);
  if (orderDateTo) query = query.lte("orderDate", orderDateTo);
  if (promisedDateFrom) query = query.gte("promisedDate", promisedDateFrom);
  if (promisedDateTo) query = query.lte("promisedDate", promisedDateTo);
  if (completedDateFrom) query = query.gte("completedDate", completedDateFrom);
  if (completedDateTo) query = query.lte("completedDate", completedDateTo);
  if (deliveredDateFrom) query = query.gte("deliveredDate", deliveredDateFrom);
  if (deliveredDateTo) query = query.lte("deliveredDate", deliveredDateTo);

  // Search filter across jobNo and line item descriptions
  if (search) {
    const { data: matchingItems } = await supabase
      .from("job_line_items")
      .select("job_id")
      .ilike("itemDescription", `%${search}%`);

    const matchingJobIds = Array.from(
      new Set((matchingItems || []).map((i) => i.job_id)),
    );

    const escapedSearch = search.replace(/"/g, '""');

    if (matchingJobIds.length > 0) {
      query = query.or(
        `jobNo.ilike."%${escapedSearch}%",id.in.(${matchingJobIds.join(",")})`,
      );
    } else {
      query = query.ilike("jobNo", `%${search}%`);
    }
  }

  // Sorting
  const directSortColumns = [
    "jobNo",
    "orderDate",
    "promisedDate",
    "completedDate",
    "deliveredDate",
    "invoiceValue",
    "inThisWeek",
    "created_at",
  ];
  const sortColumn = directSortColumns.includes(sortBy) ? sortBy : "orderDate";
  query = query.order(sortColumn, { ascending: sortDir === "asc" });

  // Pagination calculation
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const pageSize = Math.max(1, parseInt(sizeParam, 10) || 25);
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  query = query.range(from, to);

  const { data: jobs, count: filteredTotalCount, error } = await query;

  if (error) {
    console.error("Error fetching paginated jobs:", error);
    return (
      <div className="p-8 text-destructive">
        Error loading jobs: {error.message}
      </div>
    );
  }

  return (
    <JobsDashboardClient
      jobs={(jobs || []) as unknown as JobWithItems[]}
      userRole={userRole}
      totalCount={filteredTotalCount ?? 0}
      currentPage={currentPage}
      pageSize={pageSize}
      kpiMetrics={{
        total: totalCount ?? 0,
        pending: pendingCount ?? 0,
        completed: completedCount ?? 0,
        overdue: overdueCount ?? 0,
      }}
    />
  );
}
