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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";

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
  const { jobs, addJobItem, updateJobItem, deleteJobItem, selectedRole } =
    useTracker();
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

  // Form states
  const [jobNo, setJobNo] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [orderDate, setOrderDate] = useState("");
  const [promisedDate, setPromisedDate] = useState("");
  const [completedDate, setCompletedDate] = useState("");
  const [deliveredDate, setDeliveredDate] = useState("");
  const [overdueReason, setOverdueReason] = useState("");
  const [inThisWeek, setInThisWeek] = useState(false);
  const [materialShortage, setMaterialShortage] = useState("");
  const [equipmentIssue, setEquipmentIssue] = useState("");
  const [invoiceValue, setInvoiceValue] = useState(0);
  const [spoilagePercent, setSpoilagePercent] = useState(0);
  const [reprintRequired, setReprintRequired] = useState(false);
  const [notes, setNotes] = useState("");

  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "operator" ||
    selectedRole === "manager";

  // Calculate missing dates counter
  const missingDatesCount = jobs.filter(
    (j) => !j.orderDate || !j.promisedDate,
  ).length;

  const handleOpenAdd = () => {
    setJobNo("");
    setItemDescription("");
    setQuantity(100);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setPromisedDate("");
    setCompletedDate("");
    setDeliveredDate("");
    setOverdueReason("");
    setInThisWeek(false);
    setMaterialShortage("");
    setEquipmentIssue("");
    setInvoiceValue(0);
    setSpoilagePercent(0);
    setReprintRequired(false);
    setNotes("");
    setEditingJob(null);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (job: JobItem) => {
    setEditingJob(job);
    setJobNo(job.jobNo);
    setItemDescription(job.itemDescription);
    setQuantity(job.quantity);
    setOrderDate(job.orderDate);
    setPromisedDate(job.promisedDate);
    setCompletedDate(job.completedDate);
    setDeliveredDate(job.deliveredDate);
    setOverdueReason(job.overdueReason);
    setInThisWeek(job.inThisWeek);
    setMaterialShortage(job.materialShortage);
    setEquipmentIssue(job.equipmentIssue);
    setInvoiceValue(job.invoiceValue);
    setSpoilagePercent(job.spoilagePercent);
    setReprintRequired(job.reprintRequired);
    setNotes(job.notes || "");
    setIsAddOpen(true);
  };

  const isSubJob = editingJob
    ? editingJob.lineNo > 1
    : jobNo
      ? jobs.some(
          (j) => j.jobNo.trim().toUpperCase() === jobNo.trim().toUpperCase(),
        )
      : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobNo || !itemDescription || !orderDate || !promisedDate) return;

    const data = {
      jobNo,
      itemDescription,
      quantity: Number(quantity),
      orderDate,
      promisedDate,
      completedDate,
      deliveredDate,
      overdueReason,
      inThisWeek,
      materialShortage,
      equipmentIssue,
      invoiceValue: isSubJob ? 0 : Number(invoiceValue) || 0,
      spoilagePercent: Number(spoilagePercent) || 0,
      reprintRequired,
      notes,
    };

    if (editingJob) {
      updateJobItem(editingJob.id, data);
    } else {
      addJobItem(data);
    }
    setIsAddOpen(false);
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
                    daysVsPromisedVal = diffDays <= 0 ? "-" : diffDays;
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
                          {isParent ? turnaroundDaysVal || "-" : "-"}
                        </TableCell>
                        <TableCell numeric>
                          {isParent ? daysVsPromisedVal || "-" : "-"}
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
                          {isParent ? daysOverdueVal || "-" : "-"}
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
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {editingJob ? "Edit Item Row" : "Add Item Row"}
              </DialogTitle>
            </DialogHeader>
            <DialogBody className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="jobNo"
                  className="text-right text-sm font-medium"
                >
                  Job # <span className="text-destructive">*</span>
                </label>
                <Input
                  id="jobNo"
                  value={jobNo}
                  onChange={(e) => setJobNo(e.target.value)}
                  className="col-span-3 bg-card border-input focus-visible:ring-ring"
                  placeholder="e.g. J-1005"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="desc"
                  className="text-right text-sm font-medium"
                >
                  Item Desc <span className="text-destructive">*</span>
                </label>
                <Input
                  id="desc"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="col-span-3 bg-card border-input focus-visible:ring-ring"
                  placeholder="e.g. Letterheads - Nova Legal, 100gsm"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="qty" className="text-right text-sm font-medium">
                  Quantity <span className="text-destructive">*</span>
                </label>
                <Input
                  id="qty"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="col-span-3 bg-card border-input focus-visible:ring-ring font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="orderDate"
                  className="text-right text-sm font-medium"
                >
                  Order Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="orderDate"
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  required
                  className="col-span-3 bg-card border-input focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="promisedDate"
                  className="text-right text-sm font-medium"
                >
                  Promise Date <span className="text-destructive">*</span>
                </label>
                <Input
                  id="promisedDate"
                  type="date"
                  value={promisedDate}
                  onChange={(e) => setPromisedDate(e.target.value)}
                  required
                  className="col-span-3 bg-card border-input focus-visible:ring-ring"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="completedDate"
                  className="text-right text-sm font-medium"
                >
                  Comp. Date
                </label>
                <Input
                  id="completedDate"
                  type="date"
                  value={completedDate}
                  onChange={(e) => setCompletedDate(e.target.value)}
                  disabled={isSubJob}
                  className={cn(
                    "col-span-3 border-input focus-visible:ring-ring",
                    isSubJob
                      ? "bg-muted cursor-not-allowed opacity-60"
                      : "bg-card",
                  )}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="deliveredDate"
                  className="text-right text-sm font-medium"
                >
                  Deliv. Date
                </label>
                <Input
                  id="deliveredDate"
                  type="date"
                  value={deliveredDate}
                  onChange={(e) => setDeliveredDate(e.target.value)}
                  disabled={isSubJob}
                  className={cn(
                    "col-span-3 border-input focus-visible:ring-ring",
                    isSubJob
                      ? "bg-muted cursor-not-allowed opacity-60"
                      : "bg-card",
                  )}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="overdueReason"
                  className="text-right text-sm font-medium"
                >
                  Overdue Reason
                </label>
                <Input
                  id="overdueReason"
                  value={overdueReason}
                  onChange={(e) => setOverdueReason(e.target.value)}
                  disabled={isSubJob}
                  className={cn(
                    "col-span-3 border-input focus-visible:ring-ring",
                    isSubJob
                      ? "bg-muted cursor-not-allowed opacity-60"
                      : "bg-card",
                  )}
                  placeholder="e.g. Courier delay"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right text-sm font-medium">
                  Schedule?
                </label>
                <div className="col-span-3 flex items-center gap-2">
                  <Checkbox
                    id="inThisWeek"
                    checked={inThisWeek}
                    onCheckedChange={(checked) => setInThisWeek(!!checked)}
                  />
                  <label
                    htmlFor="inThisWeek"
                    className="text-xs text-muted-foreground select-none"
                  >
                    In This Week? (Y/N)
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="shortage"
                  className="text-right text-sm font-medium"
                >
                  Material Notes
                </label>
                <Input
                  id="shortage"
                  value={materialShortage}
                  onChange={(e) => setMaterialShortage(e.target.value)}
                  className="col-span-3 bg-card border-input focus-visible:ring-ring"
                  placeholder="e.g. Shortage info"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="issue"
                  className="text-right text-sm font-medium"
                >
                  Equip. Issues
                </label>
                <Input
                  id="issue"
                  value={equipmentIssue}
                  onChange={(e) => setEquipmentIssue(e.target.value)}
                  className="col-span-3 bg-card border-input focus-visible:ring-ring"
                  placeholder="e.g. Machine error"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label
                  htmlFor="invoice"
                  className="text-right text-sm font-medium"
                >
                  Invoice Value
                </label>
                <Input
                  id="invoice"
                  type="number"
                  value={invoiceValue}
                  onChange={(e) => setInvoiceValue(Number(e.target.value))}
                  disabled={isSubJob}
                  className={cn(
                    "col-span-3 border-input focus-visible:ring-ring font-mono",
                    isSubJob
                      ? "bg-muted cursor-not-allowed opacity-60"
                      : "bg-card",
                  )}
                />
              </div>

              <div className="border-t border-border my-2 pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                  Waste & Rework Log
                </h4>
                <div className="grid gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label
                      htmlFor="spoilagePercent"
                      className="text-right text-sm font-medium"
                    >
                      Spoilage %
                    </label>
                    <Input
                      id="spoilagePercent"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={spoilagePercent}
                      onChange={(e) =>
                        setSpoilagePercent(Number(e.target.value))
                      }
                      className="col-span-3 bg-card border-input focus-visible:ring-ring font-mono"
                      placeholder="e.g. 3.5"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label className="text-right text-sm font-medium">
                      Reprint?
                    </label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Checkbox
                        id="reprintRequired"
                        checked={reprintRequired}
                        onCheckedChange={(checked) =>
                          setReprintRequired(!!checked)
                        }
                      />
                      <label
                        htmlFor="reprintRequired"
                        className="text-xs text-muted-foreground select-none"
                      >
                        Flag as needing reprint (Y/N)
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label
                      htmlFor="notes"
                      className="text-right text-sm font-medium"
                    >
                      Quality Notes
                    </label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="col-span-3 bg-card border-input focus-visible:ring-ring"
                      placeholder="e.g. Defective layout cut"
                    />
                  </div>
                </div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                Save changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageBody>
  );
}
