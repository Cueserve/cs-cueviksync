/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  useTracker,
  type JobItem,
} from "@/components/providers/tracker-provider";

export interface JobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingJob: JobItem | null;
}

export function JobDialog({ open, onOpenChange, editingJob }: JobDialogProps) {
  const { jobs, addJobItem, updateJobItem } = useTracker();

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

  useEffect(() => {
    if (open) {
      if (editingJob) {
        setJobNo(editingJob.jobNo);
        setItemDescription(editingJob.itemDescription);
        setQuantity(editingJob.quantity);
        setOrderDate(editingJob.orderDate);
        setPromisedDate(editingJob.promisedDate || "");
        setCompletedDate(editingJob.completedDate || "");
        setDeliveredDate(editingJob.deliveredDate || "");
        setOverdueReason(editingJob.overdueReason || "");
        setInThisWeek(editingJob.inThisWeek || false);
        setMaterialShortage(editingJob.materialShortage || "");
        setEquipmentIssue(editingJob.equipmentIssue || "");
        setInvoiceValue(editingJob.invoiceValue || 0);
        setSpoilagePercent(editingJob.spoilagePercent || 0);
        setReprintRequired(editingJob.reprintRequired || false);
        setNotes(editingJob.notes || "");
      } else {
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
      }
    }
  }, [open, editingJob]);

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

    if (
      completedDate &&
      deliveredDate &&
      new Date(deliveredDate) < new Date(completedDate)
    ) {
      alert("Delivery date cannot be earlier than the completion date.");
      return;
    }

    if (
      promisedDate &&
      orderDate &&
      new Date(promisedDate) < new Date(orderDate)
    ) {
      alert("Promise date cannot be earlier than the order date.");
      return;
    }

    if (
      completedDate &&
      orderDate &&
      new Date(completedDate) < new Date(orderDate)
    ) {
      alert("Completion date cannot be earlier than the order date.");
      return;
    }

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
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[700px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {editingJob ? "Edit Item Row" : "Add Item Row"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-6 py-6 px-4 sm:px-6">
            {/* Top Section: Job Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="jobNo"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Job # <span className="text-destructive">*</span>
                </label>
                <Input
                  id="jobNo"
                  value={jobNo}
                  onChange={(e) => setJobNo(e.target.value)}
                  className="bg-card border-input focus-visible:ring-ring"
                  placeholder="e.g. J-1005"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="qty"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Quantity <span className="text-destructive">*</span>
                </label>
                <Input
                  id="qty"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="bg-card border-input focus-visible:ring-ring font-mono"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="invoice"
                  className="text-xs font-medium text-muted-foreground"
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
                    "border-input focus-visible:ring-ring font-mono",
                    isSubJob
                      ? "bg-muted cursor-not-allowed opacity-60"
                      : "bg-card",
                  )}
                />
              </div>

              <div className="col-span-3 space-y-2">
                <label
                  htmlFor="desc"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Item Desc <span className="text-destructive">*</span>
                </label>
                <Input
                  id="desc"
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="bg-card border-input focus-visible:ring-ring"
                  placeholder="e.g. Letterheads - Nova Legal, 100gsm"
                  required
                />
              </div>
            </div>

            {/* Delivery & Timeline */}
            <div className="rounded-md border border-border p-4 bg-muted/10 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Timeline & Status
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="orderDate"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Order Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    required
                    className="bg-card border-input focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="promisedDate"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Promise Date <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="promisedDate"
                    type="date"
                    value={promisedDate}
                    onChange={(e) => setPromisedDate(e.target.value)}
                    required
                    min={orderDate || undefined}
                    className="bg-card border-input focus-visible:ring-ring"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="completedDate"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Comp. Date
                  </label>
                  <Input
                    id="completedDate"
                    type="date"
                    value={completedDate}
                    onChange={(e) => setCompletedDate(e.target.value)}
                    disabled={isSubJob}
                    min={orderDate || undefined}
                    className={cn(
                      "border-input focus-visible:ring-ring",
                      isSubJob
                        ? "bg-muted cursor-not-allowed opacity-60"
                        : "bg-card",
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="deliveredDate"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Deliv. Date
                  </label>
                  <Input
                    id="deliveredDate"
                    type="date"
                    value={deliveredDate}
                    onChange={(e) => setDeliveredDate(e.target.value)}
                    disabled={isSubJob}
                    min={completedDate || undefined}
                    className={cn(
                      "border-input focus-visible:ring-ring",
                      isSubJob
                        ? "bg-muted cursor-not-allowed opacity-60"
                        : "bg-card",
                    )}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label
                    htmlFor="overdueReason"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Overdue Reason
                  </label>
                  <Input
                    id="overdueReason"
                    value={overdueReason}
                    onChange={(e) => setOverdueReason(e.target.value)}
                    disabled={isSubJob}
                    className={cn(
                      "border-input focus-visible:ring-ring",
                      isSubJob
                        ? "bg-muted cursor-not-allowed opacity-60"
                        : "bg-card",
                    )}
                    placeholder="e.g. Courier delay"
                  />
                </div>
              </div>
            </div>

            {/* Issues & Scheduling */}
            <div className="rounded-md border border-border p-4 bg-muted/10 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Issues & Scheduling
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="shortage"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Material Shortage
                  </label>
                  <Input
                    id="shortage"
                    value={materialShortage}
                    onChange={(e) => setMaterialShortage(e.target.value)}
                    className="bg-card border-input focus-visible:ring-ring"
                    placeholder="e.g. Shortage info"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="issue"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Equip. Issues
                  </label>
                  <Input
                    id="issue"
                    value={equipmentIssue}
                    onChange={(e) => setEquipmentIssue(e.target.value)}
                    className="bg-card border-input focus-visible:ring-ring"
                    placeholder="e.g. Machine error"
                  />
                </div>

                <div className="flex items-center gap-2 pt-8">
                  <Checkbox
                    id="inThisWeek"
                    checked={inThisWeek}
                    onCheckedChange={(checked) => setInThisWeek(!!checked)}
                  />
                  <label
                    htmlFor="inThisWeek"
                    className="text-xs font-medium text-muted-foreground select-none"
                  >
                    Schedule In This Week?
                  </label>
                </div>
              </div>
            </div>

            {/* Waste & Rework */}
            <div className="rounded-md border border-border p-4 bg-muted/10 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Waste & Rework Log
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="spoilagePercent"
                    className="text-xs font-medium text-muted-foreground"
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
                    onChange={(e) => setSpoilagePercent(Number(e.target.value))}
                    className="bg-card border-input focus-visible:ring-ring font-mono"
                    placeholder="e.g. 3.5"
                  />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <Checkbox
                    id="reprintRequired"
                    checked={reprintRequired}
                    onCheckedChange={(checked) => setReprintRequired(!!checked)}
                  />
                  <label
                    htmlFor="reprintRequired"
                    className="text-xs font-medium text-muted-foreground select-none"
                  >
                    Flag as needing reprint
                  </label>
                </div>
                <div className="col-span-2 space-y-2">
                  <label
                    htmlFor="notes"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Quality Notes
                  </label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bg-card border-input focus-visible:ring-ring"
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
              onClick={() => onOpenChange(false)}
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
  );
}
