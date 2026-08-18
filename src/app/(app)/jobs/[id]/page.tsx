"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  useTracker,
  type JobItem,
  type JobLineItem,
} from "@/components/providers/tracker-provider";
import {
  Hash,
  DollarSign,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Calculator,
} from "lucide-react";
import { calculateJobFormulas } from "@/lib/job-formulas";

export default function JobDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { jobs, addJob, updateJob, selectedRole } = useTracker();

  const isNew = id === "new";
  const existingJob = isNew ? null : jobs.find((j) => j.id === id);

  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "operator" ||
    selectedRole === "manager";

  const [draftJob, setDraftJob] = useState<JobItem>({
    id: "",
    jobNo: "",
    orderDate: new Date().toISOString().split("T")[0],
    promisedDate: "",
    completedDate: "",
    deliveredDate: "",
    overdueReason: "",
    inThisWeek: false,
    invoiceValue: 0,
    spoilagePercent: 0,
    reprintRequired: false,
    notes: "",
    items: [
      {
        id: "temp-1",
        lineNo: 1,
        itemDescription: "",
        quantity: 0,
        materialShortage: "",
        equipmentIssue: "",
      },
    ],
  });

  const [isPreviewMode, setIsPreviewMode] = useState(!canEdit);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!canEdit) setIsPreviewMode(true);
  }, [canEdit]);

  const previewInputClass = isPreviewMode
    ? "border-transparent bg-transparent shadow-none px-0 disabled:opacity-100 disabled:cursor-default disabled:text-foreground"
    : "";

  useEffect(() => {
    if (existingJob) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftJob(JSON.parse(JSON.stringify(existingJob))); // deep copy
    }
  }, [existingJob]);

  if (!isNew && !existingJob) {
    return (
      <div className="p-8">
        <p>Job not found.</p>
        <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUpdateField = (field: keyof JobItem, value: any) => {
    setDraftJob((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "orderDate" && value) {
        if (
          next.promisedDate &&
          new Date(value) > new Date(next.promisedDate)
        ) {
          next.promisedDate = "";
        }
        if (
          next.completedDate &&
          new Date(value) > new Date(next.completedDate)
        ) {
          next.completedDate = "";
          next.deliveredDate = "";
        }
      }

      if (field === "completedDate") {
        if (value) {
          if (
            !next.deliveredDate ||
            new Date(value) > new Date(next.deliveredDate)
          ) {
            next.deliveredDate = value;
          }
        } else {
          next.deliveredDate = "";
        }
      }

      return next;
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof JobLineItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => {
    setDraftJob((prev) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setDraftJob((prev) => {
      const newLineNo =
        prev.items.length > 0
          ? Math.max(...prev.items.map((i) => i.lineNo)) + 1
          : 1;
      const newItem: JobLineItem = {
        id: `temp-${Date.now()}`,
        lineNo: newLineNo,
        itemDescription: "",
        quantity: 0,
        materialShortage: "",
        equipmentIssue: "",
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const handleDeleteItem = (index: number) => {
    setDraftJob((prev) => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      // Reindex line numbers
      newItems.forEach((item, i) => {
        item.lineNo = i + 1;
      });
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    if (!draftJob.jobNo) {
      alert("Job number is required");
      return;
    }
    if (!draftJob.orderDate) {
      alert("Order Date is required");
      return;
    }
    if (!draftJob.promisedDate) {
      alert("Promised Date is required");
      return;
    }
    if (draftJob.items.length === 0) {
      alert("At least one item is required");
      return;
    }
    if (
      draftJob.completedDate &&
      draftJob.deliveredDate &&
      new Date(draftJob.deliveredDate) < new Date(draftJob.completedDate)
    ) {
      alert("Delivered date cannot be earlier than Completed date.");
      return;
    }

    if (isNew) {
      addJob(draftJob);
    } else {
      updateJob(draftJob.id, draftJob);
    }
    router.push("/jobs");
  };

  // Calculations for Summary Pane
  const {
    isCompleted,
    isOverdue,
    totalQty,
    turnaroundDaysVal,
    daysVsPromisedVal,
    daysOverdueVal,
    onTimeVal,
    weekEndingStr,
    scheduledThisWeekVal,
  } = calculateJobFormulas(draftJob);

  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 text-muted-foreground -ml-2 hover:bg-transparent"
            onClick={() => router.push("/jobs")}
          >
            <ArrowLeft className="size-4 mr-1" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Hash className="size-8 text-primary" />
            {isNew ? "New Job" : `Job Details: ${draftJob.jobNo}`}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form & Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="jobNo"
                >
                  Job Number *
                </label>
                <Input
                  id="jobNo"
                  value={draftJob.jobNo}
                  onChange={(e) => handleUpdateField("jobNo", e.target.value)}
                  disabled={!canEdit || isPreviewMode}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="invoiceValue"
                >
                  Invoice Value ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invoiceValue"
                    type="number"
                    className="pl-9"
                    value={draftJob.invoiceValue}
                    onChange={(e) =>
                      handleUpdateField("invoiceValue", Number(e.target.value))
                    }
                    disabled={!canEdit || isPreviewMode}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="orderDate"
                >
                  Order Date *
                </label>
                <Input
                  id="orderDate"
                  type="date"
                  value={draftJob.orderDate}
                  onChange={(e) =>
                    handleUpdateField("orderDate", e.target.value)
                  }
                  disabled={!canEdit || isPreviewMode}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="promisedDate"
                >
                  Promised Date *
                </label>
                <Input
                  id="promisedDate"
                  type="date"
                  min={draftJob.orderDate || undefined}
                  value={draftJob.promisedDate}
                  onChange={(e) =>
                    handleUpdateField("promisedDate", e.target.value)
                  }
                  disabled={!canEdit || isPreviewMode}
                  required
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="completedDate"
                >
                  Completed Date
                </label>
                <Input
                  id="completedDate"
                  type="date"
                  min={draftJob.orderDate || undefined}
                  value={draftJob.completedDate}
                  onChange={(e) =>
                    handleUpdateField("completedDate", e.target.value)
                  }
                  disabled={!canEdit || isPreviewMode}
                />
              </div>
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="deliveredDate"
                >
                  Delivered Date
                </label>
                <Input
                  id="deliveredDate"
                  type="date"
                  min={draftJob.completedDate || undefined}
                  value={draftJob.deliveredDate}
                  onChange={(e) =>
                    handleUpdateField("deliveredDate", e.target.value)
                  }
                  disabled={
                    !canEdit || isPreviewMode || !draftJob.completedDate
                  }
                />
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="overdueReason"
                >
                  Overdue Reason
                </label>
                <Input
                  id="overdueReason"
                  value={draftJob.overdueReason}
                  onChange={(e) =>
                    handleUpdateField("overdueReason", e.target.value)
                  }
                  className={cn(isPreviewMode && "truncate")}
                  title={draftJob.overdueReason}
                  disabled={!canEdit || isPreviewMode}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inThisWeek"
                  checked={draftJob.inThisWeek}
                  onCheckedChange={(checked) =>
                    handleUpdateField("inThisWeek", checked)
                  }
                  disabled={!canEdit || isPreviewMode}
                />
                <label
                  htmlFor="inThisWeek"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Scheduled This Week
                </label>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h2 className="text-lg font-semibold">Items in this Job</h2>
              {canEdit && (
                <Button variant="outline" size="sm" onClick={handleAddItem}>
                  <Plus className="size-4 mr-2" /> Add Item
                </Button>
              )}
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Line</th>
                    <th className="px-4 py-3 font-medium min-w-[200px]">
                      Description
                    </th>
                    <th className="px-4 py-3 font-medium w-24">Qty</th>
                    <th className="px-4 py-3 font-medium">Mat. Shortage</th>
                    <th className="px-4 py-3 font-medium">Eq. Issue</th>
                    {canEdit && (
                      <th className="px-4 py-3 font-medium w-16"></th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {draftJob.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {item.lineNo}
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={item.itemDescription}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "itemDescription",
                              e.target.value,
                            )
                          }
                          placeholder="Item description..."
                          className={cn(
                            "h-8",
                            previewInputClass,
                            isPreviewMode &&
                              "truncate max-w-[200px] md:max-w-xs xl:max-w-md",
                          )}
                          title={item.itemDescription}
                          disabled={!canEdit || isPreviewMode}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          type="number"
                          value={item.quantity || ""}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number(e.target.value),
                            )
                          }
                          className={cn("h-8 text-right", previewInputClass)}
                          disabled={!canEdit || isPreviewMode}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={item.materialShortage}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "materialShortage",
                              e.target.value,
                            )
                          }
                          placeholder="Y/N or reason"
                          className={cn(
                            "h-8",
                            previewInputClass,
                            isPreviewMode && "truncate max-w-[150px]",
                          )}
                          title={item.materialShortage}
                          disabled={!canEdit || isPreviewMode}
                        />
                      </td>
                      <td className="px-4 py-2">
                        <Input
                          value={item.equipmentIssue}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "equipmentIssue",
                              e.target.value,
                            )
                          }
                          placeholder="Y/N or reason"
                          className={cn(
                            "h-8",
                            previewInputClass,
                            isPreviewMode && "truncate max-w-[150px]",
                          )}
                          title={item.equipmentIssue}
                          disabled={!canEdit || isPreviewMode}
                        />
                      </td>
                      {canEdit && (
                        <td className="px-4 py-2 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            onClick={() => handleDeleteItem(index)}
                            disabled={draftJob.items.length === 1}
                            title={
                              draftJob.items.length === 1
                                ? "Cannot delete the last item"
                                : "Delete Item"
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {draftJob.items.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No items. Click &quot;Add Item&quot; to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-lg font-semibold mb-4">Waste & Notes</h2>
            <div className="flex flex-col md:flex-row md:items-end gap-6 mb-4">
              <div className="space-y-2 flex-1">
                <label
                  className="text-sm font-medium leading-none"
                  htmlFor="spoilagePercent"
                >
                  Spoilage (%)
                </label>
                <Input
                  id="spoilagePercent"
                  type="number"
                  step="0.1"
                  value={draftJob.spoilagePercent}
                  onChange={(e) =>
                    handleUpdateField("spoilagePercent", Number(e.target.value))
                  }
                  disabled={!canEdit || isPreviewMode}
                />
              </div>
              <div className="flex items-center space-x-2 flex-1 pb-2.5">
                <Checkbox
                  id="reprintRequired"
                  checked={draftJob.reprintRequired}
                  onCheckedChange={(checked) =>
                    handleUpdateField("reprintRequired", checked)
                  }
                  disabled={!canEdit || isPreviewMode}
                />
                <label
                  htmlFor="reprintRequired"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Reprint Required
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none"
                htmlFor="notes"
              >
                Notes
              </label>
              <textarea
                id="notes"
                value={draftJob.notes}
                onChange={(e) => handleUpdateField("notes", e.target.value)}
                placeholder="Add any additional job notes here..."
                disabled={!canEdit || isPreviewMode}
                className="min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary */}
        <div className="space-y-6 sticky top-6">
          {canEdit && (
            <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                Status / Actions
              </h2>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                {isPreviewMode ? "Exit Preview" : "Preview Mode"}
              </Button>
              {!isPreviewMode && (
                <>
                  <Button
                    className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent"
                    onClick={handleSubmit}
                  >
                    <Save className="size-4 mr-2" /> Save Job
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/jobs")}
                  >
                    Discard
                  </Button>
                </>
              )}
            </div>
          )}

          <div className="bg-card text-card-foreground border border-border rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calculator className="size-5 text-primary" /> Calculated Fields
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Status</span>
                {isCompleted ? (
                  <span className="inline-flex items-center rounded bg-success/10 px-2 py-0.5 text-xs font-semibold text-success">
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded bg-warning/10 px-2 py-0.5 text-xs font-semibold text-warning">
                    Pending
                  </span>
                )}
              </div>

              {isOverdue && (
                <div className="flex justify-between items-center border-b border-border/50 pb-3">
                  <span className="text-muted-foreground">Overdue Flag</span>
                  <span className="inline-flex items-center rounded bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                    Overdue
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-bold text-lg">
                  {draftJob.items.length}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Total Quantity</span>
                <span className="font-bold text-lg">
                  {totalQty.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Invoice Value</span>
                <span className="font-bold text-lg">
                  ${(draftJob.invoiceValue || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Turnaround</span>
                <span className="font-bold">
                  {turnaroundDaysVal}
                  {typeof turnaroundDaysVal === "number" ? " days" : ""}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Days vs Promised</span>
                <span
                  className={`font-bold ${typeof daysVsPromisedVal === "number" ? (daysVsPromisedVal > 0 ? "text-destructive" : daysVsPromisedVal <= 0 ? "text-success" : "") : ""}`}
                >
                  {typeof daysVsPromisedVal === "number"
                    ? Math.abs(daysVsPromisedVal)
                    : daysVsPromisedVal}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">On-Time? (Y/N)</span>
                <span className="font-bold">{onTimeVal}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">
                  Scheduled This Week
                </span>
                <span className="font-bold">{scheduledThisWeekVal}</span>
              </div>

              <div className="flex justify-between items-center border-b border-border/50 pb-3">
                <span className="text-muted-foreground">Week Ending (Mon)</span>
                <span className="font-bold">{weekEndingStr}</span>
              </div>

              {isOverdue && (
                <div className="flex justify-between items-center pb-1">
                  <span className="text-destructive font-medium">
                    Days Overdue
                  </span>
                  <span className="font-bold text-destructive">
                    {daysOverdueVal}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
