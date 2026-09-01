import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { DollarSign } from "lucide-react";
import type { JobWithItems } from "@/app/(app)/jobs/_components/JobsDashboardClient";

interface JobDetailsFormProps {
  draftJob: JobWithItems;
  canEdit: boolean;
  isPreviewMode: boolean;
  jobs: JobWithItems[];
  handleUpdateField: (
    field: keyof JobWithItems,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => void;
}

export function JobDetailsForm({
  draftJob,
  canEdit,
  isPreviewMode,
  handleUpdateField,
}: JobDetailsFormProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">Job Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onChange={(e) => handleUpdateField("orderDate", e.target.value)}
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
            onChange={(e) => handleUpdateField("promisedDate", e.target.value)}
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
            value={draftJob.completedDate || ""}
            onChange={(e) => handleUpdateField("completedDate", e.target.value)}
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
            value={draftJob.deliveredDate || ""}
            onChange={(e) => handleUpdateField("deliveredDate", e.target.value)}
            disabled={!canEdit || isPreviewMode || !draftJob.completedDate}
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
              min="0"
              className="pl-9"
              value={draftJob.invoiceValue === 0 ? "" : draftJob.invoiceValue}
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
            htmlFor="overdueReason"
          >
            Overdue Reason
          </label>
          <Input
            id="overdueReason"
            value={draftJob.overdueReason || ""}
            onChange={(e) => handleUpdateField("overdueReason", e.target.value)}
            className={cn(isPreviewMode && "truncate")}
            title={draftJob.overdueReason || undefined}
            disabled={!canEdit || isPreviewMode}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center space-x-2">
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
  );
}
