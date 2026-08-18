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
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

export default function JobMasterPage() {
  const { jobs, deleteJob } = useTracker();

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
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  const toggleJob = (jobId: string) => {
    setExpandedJobs((prev) => {
      const next = new Set(prev);
      if (next.has(jobId)) next.delete(jobId);
      else next.add(jobId);
      return next;
    });
  };

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
    if (selectedTab === "all") return true;
    if (selectedTab === "pending") return !job.completedDate;
    if (selectedTab === "completed") return !!job.completedDate;
    if (selectedTab === "this-week") return job.inThisWeek;
    return true;
  });

  return (
    <PageBody>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Jobs Dashboard"
          description="Centralized pipeline view. Switch tabs to view All, Pending, Completed, or This Week."
        />
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="mr-2 size-4" />
            Add New Job
          </Link>
        </Button>
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
              <TableHead className="sticky left-10 bg-muted z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)]">
                Job #
              </TableHead>
              <TableHead className="text-center">Line #</TableHead>
              <TableHead>Item Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Promised Date</TableHead>
              <TableHead>Completed Date</TableHead>
              <TableHead>Delivered Date</TableHead>
              <TableHead className="text-center">Items in Job</TableHead>
              <TableHead>Total Qty (Job)</TableHead>
              <TableHead>Invoice Value</TableHead>
              <TableHead className="text-center">Turnaround (Days)</TableHead>
              <TableHead className="text-center">Days vs Promised</TableHead>
              <TableHead className="text-center">On-Time? (Y/N)</TableHead>
              <TableHead className="text-center">Overdue Flag</TableHead>
              <TableHead className="text-center">Days Overdue</TableHead>
              <TableHead className="text-center">Scheduled This Week</TableHead>
              <TableHead>Week Ending (Mon)</TableHead>
              <TableHead>Material Shortage?</TableHead>
              <TableHead>Equipment Issue</TableHead>
              <TableHead>Overdue Reason</TableHead>
              <TableHead className="sticky right-0 bg-muted z-10 shadow-[-2px_0_0_rgba(0,0,0,0.08)]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={23} className="p-0">
                  <TableEmptyState
                    colSpan={1}
                    message="No jobs match the active filter."
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredJobs.map((job) => {
                const {
                  statusStr,
                  weekEndingStr,
                  turnaroundDaysVal,
                  daysVsPromisedVal,
                  onTimeVal,
                  overdueFlagVal,
                  daysOverdueVal,
                  scheduledThisWeekVal,
                  itemsInJob,
                  totalQty,
                } = calculateJobFormulas(job);
                const hasMultipleItems = itemsInJob > 1;
                const isExpanded = expandedJobs.has(job.id);
                const visibleItems = isExpanded ? job.items : [job.items[0]];

                return (
                  <React.Fragment key={job.id}>
                    {visibleItems.map((item, idx) => {
                      const isFirst = idx === 0;
                      return (
                        <TableRow
                          key={item.id}
                          className={cn(!isFirst && "bg-muted/30")}
                        >
                          <TableCell className="sticky left-0 bg-background z-10 w-10 px-2 text-center">
                            {isFirst && hasMultipleItems ? (
                              <button
                                onClick={() => toggleJob(job.id)}
                                className="p-1 hover:bg-muted rounded text-muted-foreground"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="size-4" />
                                ) : (
                                  <ChevronRight className="size-4" />
                                )}
                              </button>
                            ) : null}
                          </TableCell>
                          <TableCell className="sticky left-10 bg-background z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)] font-medium">
                            {isFirst ? (
                              <Link
                                href={`/jobs/${job.id}`}
                                className="text-primary hover:underline"
                              >
                                {job.jobNo}
                              </Link>
                            ) : (
                              <div className="pl-2 text-muted-foreground border-l-2 border-muted-foreground/30 ml-2"></div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.lineNo}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={item.itemDescription}
                          >
                            {item.itemDescription}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell>
                            {isFirst ? (
                              statusStr.toLowerCase() === "completed" ? (
                                <span className="inline-flex items-center rounded bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success uppercase tracking-wider">
                                  Completed
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning uppercase tracking-wider">
                                  Pending
                                </span>
                              )
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {isFirst ? formatDateUS(job.orderDate) || "-" : "-"}
                          </TableCell>
                          <TableCell>
                            {isFirst
                              ? formatDateUS(job.promisedDate) || "-"
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {isFirst
                              ? formatDateUS(job.completedDate) || "-"
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {isFirst
                              ? formatDateUS(job.deliveredDate) || "-"
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirst ? itemsInJob : "-"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {isFirst ? totalQty : "-"}
                          </TableCell>
                          <TableCell>
                            {isFirst && job.invoiceValue > 0
                              ? `${job.invoiceValue.toFixed(2)}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirst
                              ? turnaroundDaysVal !== ""
                                ? turnaroundDaysVal
                                : "-"
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirst ? (
                              daysVsPromisedVal !== "" ? (
                                <span
                                  className={
                                    typeof daysVsPromisedVal === "number"
                                      ? daysVsPromisedVal > 0
                                        ? "text-destructive"
                                        : daysVsPromisedVal <= 0
                                          ? "text-success"
                                          : ""
                                      : ""
                                  }
                                >
                                  {typeof daysVsPromisedVal === "number"
                                    ? Math.abs(daysVsPromisedVal)
                                    : daysVsPromisedVal}
                                </span>
                              ) : (
                                "-"
                              )
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirst && onTimeVal ? (
                              <StatusBadge value={onTimeVal} />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirst && overdueFlagVal ? (
                              <span className="inline-flex items-center rounded bg-destructive/20 px-2 py-0.5 text-[10px] font-semibold text-destructive uppercase tracking-wider">
                                Overdue
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-center",
                              isFirst &&
                                daysOverdueVal !== "" &&
                                Number(daysOverdueVal) > 0
                                ? "text-destructive font-bold"
                                : "",
                            )}
                          >
                            {isFirst
                              ? daysOverdueVal !== ""
                                ? daysOverdueVal
                                : "-"
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {isFirst && scheduledThisWeekVal ? (
                              <StatusBadge value={scheduledThisWeekVal} />
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {isFirst ? weekEndingStr || "-" : "-"}
                          </TableCell>
                          <TableCell>
                            {item.materialShortage ? (
                              <IssueBadge
                                type="material"
                                text={item.materialShortage}
                              />
                            ) : (
                              <IssueBadge type="material" text="No" />
                            )}
                          </TableCell>
                          <TableCell>
                            {item.equipmentIssue ? (
                              <IssueBadge
                                type="equipment"
                                text={item.equipmentIssue}
                              />
                            ) : (
                              <IssueBadge type="equipment" text="No" />
                            )}
                          </TableCell>
                          <TableCell
                            className="max-w-[200px] truncate"
                            title={isFirst ? job.overdueReason : ""}
                          >
                            {isFirst ? job.overdueReason || "-" : "-"}
                          </TableCell>
                          <TableCell className="sticky right-0 bg-background z-10 shadow-[-2px_0_0_rgba(0,0,0,0.08)]">
                            {isFirst ? (
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/jobs/${job.id}`}
                                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                                  title="Edit Job"
                                >
                                  <Pencil className="size-4" />
                                </Link>
                                <button
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        `Are you sure you want to delete Job ${job.jobNo}?`,
                                      )
                                    ) {
                                      deleteJob(job.id);
                                    }
                                  }}
                                  className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                                  title="Delete Job"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-muted-foreground/30">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </PageBody>
  );
}
