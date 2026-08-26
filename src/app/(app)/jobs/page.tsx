"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { useTracker } from "@/components/providers/tracker-provider";
import { calculateJobFormulas } from "@/lib/job-formulas";
import { cn } from "@/lib/utils";
import { formatDateUS, parseLocalDate } from "@/lib/date-utils";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { IssueBadge } from "@/components/ui/issue-badge";
import { MetricCard } from "@/components/ui/metric-card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useSort, SortConfig } from "@/hooks/use-sort";
import { JobTableRow } from "./_components/JobTableRow";

export default function JobMasterPage() {
  const { jobs, deleteJob, selectedRole } = useTracker();
  const canEdit = selectedRole !== "rep";

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

  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "completed" | "this-week"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const totalJobsCount = jobs.length;
  const completedJobsCount = jobs.filter((j) => j.completedDate).length;
  const pendingJobsCount = jobs.filter((j) => !j.completedDate).length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueJobsCount = jobs.filter(
    (j) =>
      !j.completedDate &&
      j.promisedDate &&
      today > parseLocalDate(j.promisedDate),
  ).length;

  const filteredJobs = jobs.filter((job) => {
    if (selectedTab === "pending" && !!job.completedDate) return false;
    if (selectedTab === "completed" && !job.completedDate) return false;
    if (selectedTab === "this-week" && !job.inThisWeek) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesJobNo = job.jobNo.toLowerCase().includes(q);
      const matchesDesc = job.items.some((i) =>
        i.itemDescription?.toLowerCase().includes(q),
      );
      if (!matchesJobNo && !matchesDesc) return false;
    }
    return true;
  });

  const jobsWithCalculations = React.useMemo(() => {
    return filteredJobs.map((job) => ({
      ...job,
      ...calculateJobFormulas(job),
    }));
  }, [filteredJobs]);

  const sortConfigs: SortConfig<(typeof jobsWithCalculations)[0]>[] = [
    {
      key: "orderDate",
      getValue: (item) => new Date(item.orderDate).getTime(),
    },
    {
      key: "promisedDate",
      getValue: (item) =>
        item.promisedDate ? new Date(item.promisedDate).getTime() : null,
    },
    {
      key: "completedDate",
      getValue: (item) =>
        item.completedDate ? new Date(item.completedDate).getTime() : null,
    },
    {
      key: "deliveredDate",
      getValue: (item) =>
        item.deliveredDate ? new Date(item.deliveredDate).getTime() : null,
    },
    { key: "itemsInJob", getValue: (item) => item.itemsInJob },
    { key: "totalQty", getValue: (item) => item.totalQty },
    { key: "invoiceValue", getValue: (item) => item.invoiceValue },
    {
      key: "turnaroundDays",
      getValue: (item) =>
        typeof item.turnaroundDaysVal === "number"
          ? item.turnaroundDaysVal
          : null,
    },
    {
      key: "daysVsPromised",
      getValue: (item) =>
        typeof item.daysVsPromisedVal === "number"
          ? item.daysVsPromisedVal
          : null,
    },
    {
      key: "daysOverdue",
      getValue: (item) =>
        typeof item.daysOverdueVal === "number" ? item.daysOverdueVal : null,
    },
    { key: "jobNo", getValue: (item) => item.jobNo },
    {
      key: "itemDescription",
      getValue: (item) => item.items[0]?.itemDescription || "",
    },
    { key: "qty", getValue: (item) => item.items[0]?.quantity || 0 },
    { key: "status", getValue: (item) => item.statusStr },
    { key: "onTime", getValue: (item) => item.onTimeVal },
    { key: "overdueFlag", getValue: (item) => (item.overdueFlagVal ? 1 : 0) },
    { key: "scheduledThisWeek", getValue: (item) => item.scheduledThisWeekVal },
    {
      key: "weekEnding",
      getValue: (item) =>
        item.weekEndingStr ? new Date(item.weekEndingStr).getTime() : 0,
    },
    {
      key: "materialShortage",
      getValue: (item) => (item.items.some((i) => i.materialShortage) ? 1 : 0),
    },
    {
      key: "equipmentIssue",
      getValue: (item) => (item.items.some((i) => i.equipmentIssue) ? 1 : 0),
    },
    { key: "overdueReason", getValue: (item) => item.overdueReason || "" },
  ];

  const { sortKey, sortDirection, onSort, sortedData } = useSort(
    jobsWithCalculations,
    sortConfigs,
    "orderDate",
    "desc",
  );

  const {
    page,
    size,
    onPageChange,
    onSizeChange,
    pageCount,
    paginatedData: paginatedJobs,
  } = usePagination(sortedData, 25);

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
          value={totalJobsCount}
          icon={<Package className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Pending Jobs"
          value={pendingJobsCount}
          icon={<Clock className="size-4 text-muted-foreground" />}
        />
        <MetricCard
          title="Completed Jobs"
          value={completedJobsCount}
          icon={<CheckCircle className="size-4 text-success" />}
        />
        <MetricCard
          title="Overdue Jobs"
          value={overdueJobsCount}
          icon={<AlertTriangle className="size-4 text-destructive" />}
          valueClassName={
            overdueJobsCount > 0 ? "text-destructive font-bold" : ""
          }
        />
      </div>

      {/* Status Tabs */}
      <div className="flex items-center justify-between border-b border-border mt-8">
        <div className="flex">
          {(["all", "pending", "completed", "this-week"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={cn(
                  "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px] capitalize",
                  selectedTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.replace("-", " ")}
              </button>
            ),
          )}
        </div>
        <div className="pb-2 flex items-center">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[250px] h-9"
            />
          </div>
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
              <TableHead className="sticky left-0 w-10 px-2 bg-muted z-10"></TableHead>
              <SortableTableHead
                className="sticky left-10 bg-muted z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)]"
                sortKey="jobNo"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Job #
              </SortableTableHead>
              <TableHead className="text-center">Line #</TableHead>
              <SortableTableHead
                sortKey="itemDescription"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Item Description
              </SortableTableHead>
              <SortableTableHead
                sortKey="qty"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Qty
              </SortableTableHead>
              <SortableTableHead
                sortKey="status"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Status
              </SortableTableHead>
              <SortableTableHead
                sortKey="orderDate"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Order Date
              </SortableTableHead>
              <SortableTableHead
                sortKey="promisedDate"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Promised Date
              </SortableTableHead>
              <SortableTableHead
                sortKey="completedDate"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Completed Date
              </SortableTableHead>
              <SortableTableHead
                sortKey="deliveredDate"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Delivered Date
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="itemsInJob"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Items in Job
              </SortableTableHead>
              <SortableTableHead
                sortKey="totalQty"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Total Qty (Job)
              </SortableTableHead>
              <SortableTableHead
                sortKey="invoiceValue"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Invoice Value
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="turnaroundDays"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Turnaround (Days)
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="daysVsPromised"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Days vs Promised
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="onTime"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                On-Time? (Y/N)
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="overdueFlag"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Overdue Flag
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="daysOverdue"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Days Overdue
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="scheduledThisWeek"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Scheduled This Week
              </SortableTableHead>
              <SortableTableHead
                sortKey="weekEnding"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Week Ending (Mon)
              </SortableTableHead>
              <SortableTableHead
                sortKey="materialShortage"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Material Shortage?
              </SortableTableHead>
              <SortableTableHead
                sortKey="equipmentIssue"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Equipment Issue
              </SortableTableHead>
              <SortableTableHead
                sortKey="overdueReason"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Overdue Reason
              </SortableTableHead>
              <TableHead className="sticky right-0 bg-muted z-10 shadow-[-2px_0_0_rgba(0,0,0,0.08)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={23} className="p-0">
                  <TableEmptyState
                    colSpan={1}
                    message="No jobs match the active filter."
                  />
                </TableCell>
              </TableRow>
            ) : (
              paginatedJobs.map((job) => (
                <JobTableRow
                  key={job.id}
                  job={job}
                  canEdit={canEdit}
                  onDeleteJob={deleteJob}
                />
              ))
            )}
          </TableBody>
        </Table>
        {filteredJobs.length > 0 && (
          <div className="mt-4 px-2">
            <Pagination
              page={page}
              pageCount={pageCount}
              size={size}
              onPageChange={onPageChange}
              onSizeChange={onSizeChange}
            />
          </div>
        )}
      </div>
    </PageBody>
  );
}
