"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Hash, ArrowLeft, DollarSign } from "lucide-react";
import { useJobForm } from "@/hooks/use-job-form";
import { JobLineItemsTable } from "./_components/JobLineItemsTable";
import { JobSummaryPane } from "./_components/JobSummaryPane";

export default function JobDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const {
    isNew,
    existingJob,
    canEdit,
    draftJob,
    isPreviewMode,
    setIsPreviewMode,
    handleUpdateField,
    handleItemChange,
    handleAddItem,
    handleDeleteItem,
    handleSubmit,
    jobs,
  } = useJobForm(id);

  if (!isNew && !existingJob) {
    return (
      <div className="p-8">
        <p>Job not found.</p>
        <Button onClick={() => router.push("/jobs")}>Back to Jobs</Button>
      </div>
    );
  }

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
                  className={cn(
                    jobs.some(
                      (j) =>
                        j.jobNo.trim().toLowerCase() ===
                          draftJob.jobNo.trim().toLowerCase() &&
                        j.id !== draftJob.id,
                    )
                      ? "border-destructive focus-visible:ring-destructive"
                      : "",
                  )}
                  required
                />
                {jobs.some(
                  (j) =>
                    j.jobNo.trim().toLowerCase() ===
                      draftJob.jobNo.trim().toLowerCase() &&
                    j.id !== draftJob.id,
                ) && (
                  <p className="text-xs text-destructive">
                    This job number already exists.
                  </p>
                )}
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
                    min="0"
                    className="pl-9"
                    value={
                      draftJob.invoiceValue === 0 ? "" : draftJob.invoiceValue
                    }
                    onChange={(e) => {
                      const val = e.target.value;
                      handleUpdateField(
                        "invoiceValue",
                        val === "" ? 0 : Math.max(0, Number(val)),
                      );
                    }}
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

          <JobLineItemsTable
            draftJob={draftJob}
            canEdit={canEdit}
            isPreviewMode={isPreviewMode}
            onAddItem={handleAddItem}
            onItemChange={handleItemChange}
            onDeleteItem={handleDeleteItem}
          />

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
                  min="0"
                  max="100"
                  value={
                    draftJob.spoilagePercent === 0
                      ? ""
                      : draftJob.spoilagePercent
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    handleUpdateField(
                      "spoilagePercent",
                      val === "" ? 0 : Math.min(100, Math.max(0, Number(val))),
                    );
                  }}
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
        <JobSummaryPane
          draftJob={draftJob}
          canEdit={canEdit}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
          onSubmit={handleSubmit}
          onDiscard={() => router.push("/jobs")}
        />
      </div>
    </div>
  );
}
