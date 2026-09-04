import React from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Save } from "lucide-react";
import type { JobWithItems } from "@/lib/types/jobs";
import { calculateJobFormulas } from "@/lib/job-formulas";

interface JobSummaryPaneProps {
  draftJob: JobWithItems;
  canEdit: boolean;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onDiscard: () => void;
}

export function JobSummaryPane({
  draftJob,
  canEdit,
  isPreviewMode,
  onTogglePreview,
  onSubmit,
  onDiscard,
}: JobSummaryPaneProps) {
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
    <div className="space-y-6 sticky top-6">
      {canEdit && (
        <div className="bg-card rounded-xl shadow-sm border border-border p-6 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Status / Actions
          </h2>
          <Button
            variant="outline"
            className="w-full"
            onClick={onTogglePreview}
          >
            {isPreviewMode ? "Exit Preview" : "Preview Mode"}
          </Button>
          {!isPreviewMode && (
            <>
              <Button
                className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent"
                onClick={onSubmit}
              >
                <Save className="size-4 mr-2" /> Save Job
              </Button>
              <Button variant="outline" className="w-full" onClick={onDiscard}>
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
            <span className="font-bold">{draftJob.items.length}</span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">Total Quantity</span>
            <span className="font-bold">{totalQty.toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">Invoice Value</span>
            <span className="font-bold">
              ${(draftJob.invoiceValue || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">Turnaround</span>
            <span className="font-bold">
              {turnaroundDaysVal !== "" ? (
                <>
                  {turnaroundDaysVal}
                  {typeof turnaroundDaysVal === "number" ? " days" : ""}
                </>
              ) : (
                "-"
              )}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">Days vs Promised</span>
            <span
              className={`font-bold ${typeof daysVsPromisedVal === "number" ? (daysVsPromisedVal > 0 ? "text-destructive" : daysVsPromisedVal <= 0 ? "text-success" : "") : ""}`}
            >
              {daysVsPromisedVal !== ""
                ? typeof daysVsPromisedVal === "number"
                  ? Math.abs(daysVsPromisedVal)
                  : daysVsPromisedVal
                : "-"}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">On-Time? (Y/N)</span>
            <span className="font-bold">{onTimeVal || "-"}</span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">Scheduled This Week</span>
            <span className="font-bold">{scheduledThisWeekVal || "-"}</span>
          </div>

          <div className="flex justify-between items-center border-b border-border/50 pb-3">
            <span className="text-muted-foreground">Week Ending (Mon)</span>
            <span className="font-bold">{weekEndingStr || "-"}</span>
          </div>

          {isOverdue && (
            <div className="flex justify-between items-center pb-1">
              <span className="text-destructive font-medium">Days Overdue</span>
              <span className="font-bold text-destructive">
                {daysOverdueVal}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
