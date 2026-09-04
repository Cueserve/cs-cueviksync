"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  X,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";

import { calculateJobFormulas } from "@/lib/job-formulas";
import { cn } from "@/lib/utils";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { JobTableRow } from "./JobTableRow";
import { ColumnDateFilter } from "./ColumnDateFilter";

import { deleteJob } from "@/server/actions/jobs";
import type { JobWithItems } from "@/lib/types/jobs";

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

  const canEdit = userRole !== "sales_rep";

  const handleDeleteJob = async (id: string) => {
    await deleteJob(id);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsMouseDown(false);
  const handleMouseUp = () => setIsMouseDown(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
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

  const selectedTab =
    (searchParams.get("tab") as
      "all" | "pending" | "completed" | "this-week" | "archived") || "all";
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

      {/* KPI Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4 mt-6">
        <MetricCard
          title="Total Jobs"
          value={kpiMetrics.total}
          icon={<Package className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Pending Jobs"
          value={kpiMetrics.pending}
          icon={<Clock className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Completed Jobs"
          value={kpiMetrics.completed}
          icon={<CheckCircle className="size-4 text-success" />}
        />
        <MetricCard
          title="Overdue Jobs"
          value={kpiMetrics.overdue}
          icon={<AlertTriangle className="size-4 text-destructive" />}
          valueClassName={
            kpiMetrics.overdue > 0 ? "text-destructive font-bold" : ""
          }
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center justify-between border-b border-border mt-8">
        <div className="flex">
          {(
            ["all", "pending", "completed", "this-week", "archived"] as const
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => updateFilters({ tab, page: "1" })}
              className={cn(
                "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px] capitalize",
                selectedTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.replace("-", " ")}
            </button>
          ))}
        </div>
        <div className="pb-2 flex items-center gap-2">
          {hasActiveDateFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllDateFilters}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5 mr-1" />
              Clear Date Filters
            </Button>
          )}
          <SearchInput
            placeholder="Search jobs..."
            value={searchInputVal}
            onChange={(e) => setSearchInputVal(e.target.value)}
            className="w-[250px]"
          />
        </div>
      </div>

      <div className="mt-6">
        <Table
          caption="Jobs Dashboard Pipeline"
          containerRef={scrollRef}
          containerProps={{
            onMouseDown: handleMouseDown,
            onMouseLeave: handleMouseLeave,
            onMouseUp: handleMouseUp,
            onMouseMove: handleMouseMove,
            className: cn(
              "bg-card select-none",
              isMouseDown ? "cursor-grabbing" : "cursor-grab",
            ),
          }}
          className="whitespace-nowrap"
        >
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 min-w-[40px] max-w-[40px] w-[40px] px-2 bg-muted z-10"></TableHead>
              <SortableTableHead
                className="sticky left-10 bg-muted z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)]"
                sortKey="jobNo"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Job #
              </SortableTableHead>
              <TableHead className="text-center">Line #</TableHead>
              <SortableTableHead
                sortKey="itemDescription"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Item Description
              </SortableTableHead>
              <TableHead className="text-center">Qty</TableHead>
              <SortableTableHead
                sortKey="status"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Status
              </SortableTableHead>
              <SortableTableHead
                sortKey="orderDate"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                <span>Order Date</span>
                <ColumnDateFilter
                  title="Order Date"
                  from={dateFilters.orderDate.from}
                  to={dateFilters.orderDate.to}
                  onChange={(range) =>
                    updateFilters({
                      orderDateFrom: range.from || null,
                      orderDateTo: range.to || null,
                      page: "1",
                    })
                  }
                />
              </SortableTableHead>
              <SortableTableHead
                sortKey="promisedDate"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                <span>Promised Date</span>
                <ColumnDateFilter
                  title="Promised Date"
                  from={dateFilters.promisedDate.from}
                  to={dateFilters.promisedDate.to}
                  onChange={(range) =>
                    updateFilters({
                      promisedDateFrom: range.from || null,
                      promisedDateTo: range.to || null,
                      page: "1",
                    })
                  }
                />
              </SortableTableHead>
              <SortableTableHead
                sortKey="completedDate"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                <span>Completed Date</span>
                <ColumnDateFilter
                  title="Completed Date"
                  from={dateFilters.completedDate.from}
                  to={dateFilters.completedDate.to}
                  onChange={(range) =>
                    updateFilters({
                      completedDateFrom: range.from || null,
                      completedDateTo: range.to || null,
                      page: "1",
                    })
                  }
                />
              </SortableTableHead>
              <SortableTableHead
                sortKey="deliveredDate"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                <span>Delivered Date</span>
                <ColumnDateFilter
                  title="Delivered Date"
                  from={dateFilters.deliveredDate.from}
                  to={dateFilters.deliveredDate.to}
                  onChange={(range) =>
                    updateFilters({
                      deliveredDateFrom: range.from || null,
                      deliveredDateTo: range.to || null,
                      page: "1",
                    })
                  }
                />
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="itemsInJob"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Items in Job
              </SortableTableHead>
              <SortableTableHead
                sortKey="totalQty"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Total Qty (Job)
              </SortableTableHead>
              <SortableTableHead
                sortKey="invoiceValue"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Invoice Value
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="turnaroundDays"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Turnaround (Days)
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="daysVsPromised"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Days vs Promised
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="onTime"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                On-Time? (Y/N)
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="overdueFlag"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Overdue Flag
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="daysOverdue"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Days Overdue
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="scheduledThisWeek"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Scheduled This Week
              </SortableTableHead>
              <SortableTableHead
                sortKey="weekEnding"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Week Ending (Mon)
              </SortableTableHead>
              <SortableTableHead
                sortKey="materialShortage"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Material Shortage?
              </SortableTableHead>
              <SortableTableHead
                sortKey="equipmentIssue"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Equipment Issue
              </SortableTableHead>
              <SortableTableHead
                sortKey="overdueReason"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Overdue Reason
              </SortableTableHead>
              <TableHead className="sticky right-0 bg-muted z-10 shadow-[-2px_0_0_rgba(0,0,0,0.08)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobsWithCalculations.length === 0 ? (
              <TableEmptyState
                colSpan={23}
                message="No jobs match the active filter."
              />
            ) : (
              jobsWithCalculations.map((job) => (
                <JobTableRow
                  key={job.id}
                  job={job}
                  canEdit={canEdit}
                  onDeleteJob={handleDeleteJob}
                />
              ))
            )}
          </TableBody>
        </Table>
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
