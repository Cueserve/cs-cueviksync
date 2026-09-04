import React from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { JobWithItems } from "@/lib/types/jobs";

interface JobWasteAndNotesFormProps {
  draftJob: JobWithItems;
  canEdit: boolean;
  isPreviewMode: boolean;
  handleUpdateField: (
    field: keyof JobWithItems,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
  ) => void;
}

export function JobWasteAndNotesForm({
  draftJob,
  canEdit,
  isPreviewMode,
  handleUpdateField,
}: JobWasteAndNotesFormProps) {
  return (
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
              draftJob.spoilagePercent === 0 ? "" : draftJob.spoilagePercent
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
        <label className="text-sm font-medium leading-none" htmlFor="notes">
          Notes
        </label>
        <textarea
          id="notes"
          value={draftJob.notes || ""}
          onChange={(e) => handleUpdateField("notes", e.target.value)}
          placeholder="Add any additional job notes here..."
          disabled={!canEdit || isPreviewMode}
          className="min-h-[100px] flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  );
}
