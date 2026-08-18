"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  getTurnaroundDays,
  isOnTime,
  getWeekEndingMonday,
  formatDateUS,
} from "@/lib/date-utils";

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
    setDraftJob((prev) => ({ ...prev, [field]: value }));
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
    if (draftJob.items.length === 0) {
      alert("At least one item is required");
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
  const isCompleted = !!draftJob.completedDate;
  const isOverdue =
    !isCompleted &&
    draftJob.promisedDate &&
    new Date() > new Date(draftJob.promisedDate);
  const totalQty = draftJob.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  let turnaroundDaysVal: string | number = "-";
  let daysVsPromisedVal: string | number = "-";
  if (isCompleted && draftJob.orderDate && draftJob.completedDate) {
    turnaroundDaysVal = getTurnaroundDays(
      draftJob.orderDate,
      draftJob.completedDate,
    );
  }
  if (isCompleted && draftJob.deliveredDate && draftJob.promisedDate) {
    const promiseDiff =
      new Date(draftJob.deliveredDate).getTime() -
      new Date(draftJob.promisedDate).getTime();
    daysVsPromisedVal = Math.round(promiseDiff / (1000 * 60 * 60 * 24));
  }

  let daysOverdueVal: string | number = "-";
  if (isOverdue && draftJob.promisedDate) {
    const overdueDiff =
      new Date().getTime() - new Date(draftJob.promisedDate).getTime();
    daysOverdueVal = Math.max(
      0,
      Math.round(overdueDiff / (1000 * 60 * 60 * 24)),
    );
  }

  let onTimeVal = "-";
  if (isCompleted && draftJob.promisedDate && draftJob.deliveredDate) {
    onTimeVal = isOnTime(draftJob.promisedDate, draftJob.deliveredDate)
      ? "Y"
      : "N";
  }

  const weekEndingStr =
    isCompleted && draftJob.completedDate
      ? formatDateUS(getWeekEndingMonday(draftJob.completedDate))
      : "-";

  const scheduledThisWeekVal = draftJob.inThisWeek ? "Y" : "-";

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
        {canEdit && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push("/jobs")}>
              Discard
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent"
            >
              <Save className="size-4 mr-2" /> Save Job
            </Button>
          </div>
        )}
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
                  disabled={!canEdit}
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
                    disabled={!canEdit}
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
                  disabled={!canEdit}
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
                  value={draftJob.promisedDate}
                  onChange={(e) =>
                    handleUpdateField("promisedDate", e.target.value)
                  }
                  disabled={!canEdit}
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
                  value={draftJob.completedDate}
                  onChange={(e) =>
                    handleUpdateField("completedDate", e.target.value)
                  }
                  disabled={!canEdit}
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
                  value={draftJob.deliveredDate}
                  onChange={(e) =>
                    handleUpdateField("deliveredDate", e.target.value)
                  }
                  disabled={!canEdit}
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
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="inThisWeek"
                  checked={draftJob.inThisWeek}
                  onCheckedChange={(checked) =>
                    handleUpdateField("inThisWeek", checked)
                  }
                  disabled={!canEdit}
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
                          className="h-8"
                          disabled={!canEdit}
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
                          className="h-8 text-right"
                          disabled={!canEdit}
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
                          className="h-8"
                          disabled={!canEdit}
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
                          className="h-8"
                          disabled={!canEdit}
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
                  disabled={!canEdit}
                />
              </div>
              <div className="flex items-center space-x-2 flex-1 pb-2.5">
                <Checkbox
                  id="reprintRequired"
                  checked={draftJob.reprintRequired}
                  onCheckedChange={(checked) =>
                    handleUpdateField("reprintRequired", checked)
                  }
                  disabled={!canEdit}
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
                disabled={!canEdit}
                className="min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Summary */}
        <div className="space-y-6 sticky top-6">
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
                  className={`font-bold ${typeof daysVsPromisedVal === "number" ? (daysVsPromisedVal > 0 ? "text-destructive" : "text-success") : ""}`}
                >
                  {daysVsPromisedVal}
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
