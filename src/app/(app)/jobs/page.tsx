"use client";

import React, { useState, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Package,
} from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import {
  useTracker,
  type JobItem,
} from "@/components/providers/tracker-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getWeekEndingMonday,
  getTurnaroundDays,
  isOnTime,
  formatDateUS,
} from "@/lib/date-utils";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { JobDialog } from "@/components/dialogs/job-dialog";

const formatYesNo = (val: string | undefined | null) => {
  if (!val) return "-";
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (lower === "no") return "N";
  if (lower === "yes") return "Y";
  if (lower.startsWith("yes")) {
    return "Y" + trimmed.slice(3);
  }
  if (lower.startsWith("no")) {
    return "N" + trimmed.slice(2);
  }
  return trimmed;
};

export default function JobMasterPage() {
  const { jobs, selectedRole, deleteJobItem } = useTracker();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobItem | null>(null);

  // Drag to scroll states
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

  const handleMouseLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "completed"
  >("all");

  const parentJobs = jobs.filter((j) => j.lineNo === 1);
  const totalJobsCount = parentJobs.length;
  const completedJobsCount = parentJobs.filter((j) => j.completedDate).length;
  const pendingJobsCount = parentJobs.filter((j) => !j.completedDate).length;
  const overdueJobsCount = parentJobs.filter(
    (j) =>
      !j.completedDate &&
      j.promisedDate &&
      new Date() > new Date(j.promisedDate),
  ).length;

  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "operator" ||
    selectedRole === "manager";

  // Calculate missing dates counter
  const missingDatesCount = jobs.filter(
    (j) => !j.orderDate || !j.promisedDate,
  ).length;

  const handleOpenAdd = () => {
    setEditingJob(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (job: JobItem) => {
    setEditingJob(job);
    setIsAddOpen(true);
  };

  const filteredJobs = jobs.filter((job) => {
    if (selectedTab === "all") return true;
    if (selectedTab === "pending") {
      return !job.completedDate && job.lineNo === 1;
    }
    if (selectedTab === "completed") {
      return !!job.completedDate && job.lineNo === 1;
    }
    return true;
  });

  return (
    <PageBody>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Jobs Dashboard"
          description="Centralized pipeline view. Switch tabs to view All, Pending, or Completed print orders. (Note: Sub-job row dates, invoicing, and scheduling are locked to the parent item.)"
        />
        {canEdit && (
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0"
          >
            <Plus className="size-4" /> Add Item Row
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
          <button
            onClick={() => setSelectedTab("all")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px]",
              selectedTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            All
          </button>
          <button
            onClick={() => setSelectedTab("pending")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px]",
              selectedTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Pending
          </button>
          <button
            onClick={() => setSelectedTab("completed")}
            className={cn(
              "px-4 py-2 text-sm font-semibold transition-colors border-b-2 -mb-[2px]",
              selectedTab === "completed"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Completed
          </button>
        </div>

        <div
          className={cn(
            "px-3 py-1 rounded-full border font-semibold flex items-center gap-1.5 text-xs mb-1.5",
            missingDatesCount > 0
              ? "bg-destructive/10 text-destructive border-destructive/20"
              : "bg-muted text-muted-foreground border-border",
          )}
        >
          <AlertTriangle className="size-3.5" />
          Rows missing dates:{" "}
          <span className="font-mono">{missingDatesCount}</span>
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
              {selectedTab === "all" && (
                <>
                  <TableHead className="sticky left-0 bg-muted z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)]">
                    Job #
                  </TableHead>
                  <TableHead>Line #</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Promised Date</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Delivered Date</TableHead>
                  <TableHead>Turnaround (Days)</TableHead>
                  <TableHead>Days vs Promised</TableHead>
                  <TableHead>On-Time? (Y/N)</TableHead>
                  <TableHead>Overdue Flag</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Material Shortage?</TableHead>
                  <TableHead>Equipment Issue</TableHead>
                  <TableHead>Overdue Reason</TableHead>
                  <TableHead>Invoice Value</TableHead>
                  <TableHead>Items in Job</TableHead>
                  <TableHead>Total Qty (Job)</TableHead>
                  <TableHead>Scheduled This Week</TableHead>
                  <TableHead>Week Ending (Mon)</TableHead>
                </>
              )}
              {selectedTab === "pending" && (
                <>
                  <TableHead>Job #</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Promised Date</TableHead>
                  <TableHead>Overdue Flag</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Reason (if overdue)</TableHead>
                </>
              )}
              {selectedTab === "completed" && (
                <>
                  <TableHead>Job #</TableHead>
                  <TableHead>Item Description</TableHead>
                  <TableHead>Week Ending (Mon)</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Promised Date</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Delivered Date</TableHead>
                  <TableHead>Turnaround (Days)</TableHead>
                  <TableHead>On-Time? (Y/N)</TableHead>
                  <TableHead>Invoice Value</TableHead>
                </>
              )}
              {canEdit && (
                <TableHead className="text-right sticky right-0 bg-muted">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    selectedTab === "all"
                      ? 23
                      : selectedTab === "pending"
                        ? 8
                        : 10
                  }
                  className="p-0"
                >
                  <TableEmptyState
                    colSpan={1}
                    message="No jobs match the active filter."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => {
                const hasMissingDates = !job.orderDate || !job.promisedDate;

                // Dynamic calculations
                const sameJobItems = jobs.filter((j) => j.jobNo === job.jobNo);
                const itemsInJob = sameJobItems.length;
                const totalQty = sameJobItems.reduce(
                  (sum, j) => sum + j.quantity,
                  0,
                );
                const isCompleted = !!job.completedDate;

                // Excel rule: Parent line (lineNo === 1) shows aggregate columns
                const isParent = job.lineNo === 1;

                const statusStr = isParent
                  ? isCompleted
                    ? "Completed"
                    : "Pending"
                  : "";
                const weekEndingStr =
                  isParent && isCompleted
                    ? formatDateUS(getWeekEndingMonday(job.completedDate))
                    : "";

                let turnaroundDaysVal: string | number = "";
                let daysVsPromisedVal: string | number = "";
                let onTimeVal = "";

                if (isParent && isCompleted) {
                  turnaroundDaysVal = getTurnaroundDays(
                    job.orderDate,
                    job.completedDate,
                  );
                  if (job.deliveredDate) {
                    const promiseDiff =
                      new Date(job.deliveredDate).getTime() -
                      new Date(job.promisedDate).getTime();
                    const diffDays = Math.round(
                      promiseDiff / (1000 * 60 * 60 * 24),
                    );
                    daysVsPromisedVal = diffDays;
                    onTimeVal = isOnTime(job.promisedDate, job.deliveredDate)
                      ? "Y"
                      : "N";
                  } else {
                    daysVsPromisedVal = "-";
                    onTimeVal = "";
                  }
                }

                const isOverdue =
                  isParent &&
                  !isCompleted &&
                  job.promisedDate &&
                  new Date() > new Date(job.promisedDate);
                const overdueFlagVal = isOverdue ? "Overdue" : "";

                let daysOverdueVal: string | number = "";
                if (isOverdue) {
                  const overdueDiff =
                    new Date().getTime() - new Date(job.promisedDate).getTime();
                  daysOverdueVal = Math.max(
                    0,
                    Math.round(overdueDiff / (1000 * 60 * 60 * 24)),
                  );
                }

                const scheduledThisWeekVal =
                  isParent && job.inThisWeek ? "Y" : "";

                return (
                  <TableRow
                    key={job.id}
                    className={cn(
                      hasMissingDates &&
                        "bg-destructive/5 hover:bg-destructive/10",
                    )}
                  >
                    {selectedTab === "all" && (
                      <>
                        <TableCell
                          className={cn(
                            "font-medium sticky left-0 bg-card group-hover:bg-muted/50 transition-colors z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)]",
                            hasMissingDates && "text-destructive font-bold",
                          )}
                        >
                          {job.jobNo}
                        </TableCell>
                        <TableCell numeric>{job.lineNo}</TableCell>
                        <TableCell>{job.itemDescription}</TableCell>
                        <TableCell numeric>
                          {job.quantity.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {!isParent ? (
                            <span className="text-muted-foreground">-</span>
                          ) : statusStr === "Completed" ? (
                            <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
                              Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          numeric
                          className={cn(
                            !job.orderDate &&
                              "bg-destructive/10 text-destructive font-semibold",
                          )}
                        >
                          {job.orderDate
                            ? formatDateUS(job.orderDate)
                            : "MISSING"}
                        </TableCell>
                        <TableCell
                          numeric
                          className={cn(
                            !job.promisedDate &&
                              "bg-destructive/10 text-destructive font-semibold",
                          )}
                        >
                          {job.promisedDate
                            ? formatDateUS(job.promisedDate)
                            : "MISSING"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent
                            ? formatDateUS(job.completedDate) || "-"
                            : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent
                            ? formatDateUS(job.deliveredDate) || "-"
                            : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent
                            ? turnaroundDaysVal !== ""
                              ? turnaroundDaysVal
                              : "-"
                            : "-"}
                        </TableCell>
                        <TableCell
                          numeric
                          className={cn(
                            typeof daysVsPromisedVal === "number" &&
                              daysVsPromisedVal <= 0 &&
                              "text-success font-semibold",
                            typeof daysVsPromisedVal === "number" &&
                              daysVsPromisedVal > 0 &&
                              "text-destructive font-semibold",
                          )}
                        >
                          {isParent
                            ? typeof daysVsPromisedVal === "number"
                              ? Math.abs(daysVsPromisedVal)
                              : "-"
                            : "-"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {!isParent ? (
                            <span className="font-normal text-muted-foreground">
                              -
                            </span>
                          ) : (
                            <StatusBadge value={onTimeVal} />
                          )}
                        </TableCell>
                        <TableCell className="text-destructive font-semibold">
                          {isParent ? overdueFlagVal || "-" : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent
                            ? daysOverdueVal !== ""
                              ? daysOverdueVal
                              : "-"
                            : "-"}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-warning">
                          {formatYesNo(job.materialShortage)}
                        </TableCell>
                        <TableCell className="text-xs font-medium text-destructive">
                          {formatYesNo(job.equipmentIssue)}
                        </TableCell>
                        <TableCell className="text-xs text-destructive font-medium">
                          {isParent ? job.overdueReason || "-" : "-"}
                        </TableCell>
                        <TableCell numeric className="font-medium">
                          {isParent
                            ? `$${job.invoiceValue.toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent ? itemsInJob : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent ? totalQty.toLocaleString() : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent ? (
                            <StatusBadge value={scheduledThisWeekVal} />
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell numeric>
                          {isParent ? weekEndingStr || "-" : "-"}
                        </TableCell>
                      </>
                    )}

                    {selectedTab === "pending" && (
                      <>
                        <TableCell className="font-medium">
                          {job.jobNo}
                        </TableCell>
                        <TableCell>{job.itemDescription}</TableCell>
                        <TableCell numeric>
                          {job.orderDate
                            ? formatDateUS(job.orderDate)
                            : "MISSING"}
                        </TableCell>
                        <TableCell numeric>
                          {job.promisedDate
                            ? formatDateUS(job.promisedDate)
                            : "MISSING"}
                        </TableCell>
                        <TableCell>
                          {isOverdue && (
                            <span className="inline-flex items-center rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                              Overdue
                            </span>
                          )}
                        </TableCell>
                        <TableCell
                          numeric
                          className="font-semibold text-destructive"
                        >
                          {daysOverdueVal || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-destructive font-medium">
                          {job.overdueReason || "-"}
                        </TableCell>
                      </>
                    )}

                    {selectedTab === "completed" && (
                      <>
                        <TableCell className="font-medium">
                          {job.jobNo}
                        </TableCell>
                        <TableCell>{job.itemDescription}</TableCell>
                        <TableCell numeric>{weekEndingStr}</TableCell>
                        <TableCell numeric>
                          {job.orderDate
                            ? formatDateUS(job.orderDate)
                            : "MISSING"}
                        </TableCell>
                        <TableCell numeric>
                          {job.promisedDate
                            ? formatDateUS(job.promisedDate)
                            : "MISSING"}
                        </TableCell>
                        <TableCell
                          numeric
                          className="text-success font-semibold"
                        >
                          {formatDateUS(job.completedDate)}
                        </TableCell>
                        <TableCell numeric>
                          {formatDateUS(job.deliveredDate) || "-"}
                        </TableCell>
                        <TableCell numeric>{turnaroundDaysVal}</TableCell>
                        <TableCell>
                          <StatusBadge value={onTimeVal} />
                        </TableCell>
                        <TableCell numeric className="font-medium">
                          ${job.invoiceValue.toLocaleString()}
                        </TableCell>
                      </>
                    )}

                    {canEdit && (
                      <TableCell className="text-right sticky right-0 bg-card group-hover:bg-muted/40 transition-colors shadow-[-1px_0_0_rgba(0,0,0,0.1)]">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(job)}
                            className="size-8"
                          >
                            <Edit2 className="size-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteJobItem(job.id)}
                            className="size-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog for Add/Edit */}
      <JobDialog
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        editingJob={editingJob}
      />
    </PageBody>
  );
}
