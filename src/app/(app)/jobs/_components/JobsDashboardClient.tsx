"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

import { calculateJobFormulas } from "@/lib/job-formulas";
import { canEditJobs } from "@/lib/permissions";
import { deleteJob } from "@/server/actions/jobs";
import type { JobWithItems } from "@/lib/types/jobs";

import { JobsMetricsSection } from "./JobsMetricsSection";
import { JobsFilterToolbar, type JobStatusTab } from "./JobsFilterToolbar";
import { JobsTable } from "./JobsTable";

export type { JobWithItems };

interface JobsDashboardClientProps {
  jobs: JobWithItems[];
  userRole: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  kpiMetrics: {
    total: number;
    pending: number;
    completed: number;
    overdue: number;
  };
}

export default function JobsDashboardClient({
  jobs,
  userRole,
  totalCount,
  currentPage,
  pageSize,
  kpiMetrics,
}: JobsDashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canEdit = canEditJobs(userRole);

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
  };

  // URL query helper
  const updateFilters = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      }
      router.push(`${pathname}?${current.toString()}`);
    },
    [router, pathname, searchParams],
  );

  const selectedTab = (searchParams.get("tab") as JobStatusTab) || "all";
  const currentSortKey = searchParams.get("sortBy") || "orderDate";
  const currentSortDirection =
    (searchParams.get("sortDir") as "asc" | "desc") || "desc";

  // Search input state with debouncing to URL
  const currentSearchInUrl = searchParams.get("search") || "";
  const [searchInputVal, setSearchInputVal] = useState(currentSearchInUrl);
  const [prevSearchParam, setPrevSearchParam] = useState(currentSearchInUrl);

  if (prevSearchParam !== currentSearchInUrl) {
    setPrevSearchParam(currentSearchInUrl);
    setSearchInputVal(currentSearchInUrl);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentInUrl = searchParams.get("search") || "";
      if (searchInputVal !== currentInUrl) {
        updateFilters({ search: searchInputVal || null, page: "1" });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInputVal, searchParams, updateFilters]);

  // Date filters parsed from URL
  const dateFilters = useMemo(
    () => ({
      orderDate: {
        from: searchParams.get("orderDateFrom") || "",
        to: searchParams.get("orderDateTo") || "",
      },
      promisedDate: {
        from: searchParams.get("promisedDateFrom") || "",
        to: searchParams.get("promisedDateTo") || "",
      },
      completedDate: {
        from: searchParams.get("completedDateFrom") || "",
        to: searchParams.get("completedDateTo") || "",
      },
      deliveredDate: {
        from: searchParams.get("deliveredDateFrom") || "",
        to: searchParams.get("deliveredDateTo") || "",
      },
    }),
    [searchParams],
  );

  const hasActiveDateFilters = Object.values(dateFilters).some(
    (f) => f && (f.from || f.to),
  );

  const clearAllDateFilters = () => {
    updateFilters({
      orderDateFrom: null,
      orderDateTo: null,
      promisedDateFrom: null,
      promisedDateTo: null,
      completedDateFrom: null,
      completedDateTo: null,
      deliveredDateFrom: null,
      deliveredDateTo: null,
      page: "1",
    });
  };

  const handleSort = (key: string) => {
    const nextDir =
      currentSortKey === key && currentSortDirection === "desc"
        ? "asc"
        : "desc";
    updateFilters({
      sortBy: key,
      sortDir: nextDir,
      page: "1",
    });
  };

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  const jobsWithCalculations = useMemo(() => {
    return jobs.map((job) => ({
      ...job,
      ...calculateJobFormulas(job),
    }));
  }, [jobs]);

  return (
    <PageBody>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Jobs Dashboard"
          description="Centralized pipeline view. Switch tabs to view All, Pending, Completed, or This Week."
        />
        {canEdit && (
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="mr-2 size-4" />
              Add New Job
            </Link>
          </Button>
        )}
      </div>

      <JobsMetricsSection kpiMetrics={kpiMetrics} />

      <JobsFilterToolbar
        selectedTab={selectedTab}
        onTabChange={(tab) => updateFilters({ tab, page: "1" })}
        hasActiveDateFilters={hasActiveDateFilters}
        onClearDateFilters={clearAllDateFilters}
        searchValue={searchInputVal}
        onSearchChange={setSearchInputVal}
      />

      <div className="mt-6">
        <JobsTable
          jobs={jobsWithCalculations}
          canEdit={canEdit}
          onDeleteJob={handleDeleteJob}
          currentSortKey={currentSortKey}
          currentSortDirection={currentSortDirection}
          onSort={handleSort}
          dateFilters={dateFilters}
          onDateFilterChange={updateFilters}
        />
        {totalCount > 0 && (
          <div className="mt-4 px-2">
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              size={pageSize}
              onPageChange={(newPage) =>
                updateFilters({ page: newPage.toString() })
              }
              onSizeChange={(newSize) =>
                updateFilters({ size: newSize.toString(), page: "1" })
              }
            />
          </div>
        )}
      </div>
    </PageBody>
  );
}
