import React, { useState } from "react";
import { TableRow, TableCell } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { calculateJobFormulas } from "@/lib/job-formulas";
import type { JobWithItems } from "@/lib/types/jobs";

interface WasteTableRowProps {
  job: JobWithItems;
  canEdit: boolean;
  onUpdateJob: (id: string, updates: Partial<JobWithItems>) => void;
}

export function WasteTableRow({
  job,
  canEdit,
  onUpdateJob,
}: WasteTableRowProps) {
  const [editState, setEditState] = useState<{
    spoilage?: string;
    reprint?: boolean;
    notes?: string;
  }>({});

  const displaySpoilage =
    editState.spoilage !== undefined
      ? editState.spoilage
      : job.spoilagePercent.toString();
  const displayReprint =
    editState.reprint !== undefined ? editState.reprint : job.reprintRequired;
  const displayNotes =
    editState.notes !== undefined ? editState.notes : job.notes || "";

  const handleSpoilageChange = (val: string) => {
    let restrictedVal = val;
    const num = parseFloat(val);
    if (!isNaN(num)) {
      if (num > 100) restrictedVal = "100";
      else if (num < 0) restrictedVal = "0";
    }
    setEditState((prev) => ({ ...prev, spoilage: restrictedVal }));
  };

  const handleReprintChange = (checked: boolean) => {
    setEditState((prev) => ({ ...prev, reprint: checked }));
    onUpdateJob(job.id, { reprintRequired: checked });
  };

  const handleNotesChange = (val: string) => {
    setEditState((prev) => ({ ...prev, notes: val }));
  };

  const handleBlur = (field: "spoilage" | "notes") => {
    if (field === "spoilage" && editState.spoilage !== undefined) {
      const parsed = parseFloat(editState.spoilage);
      const cleanedVal = isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
      onUpdateJob(job.id, { spoilagePercent: cleanedVal });
    } else if (field === "notes" && editState.notes !== undefined) {
      onUpdateJob(job.id, { notes: editState.notes });
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">{job.jobNo}</TableCell>
      <TableCell>
        <div
          className="max-w-[250px] truncate"
          title={job.items
            .map((i) => i.itemDescription)
            .filter(Boolean)
            .join(", ")}
        >
          {job.items
            .map((i) => i.itemDescription)
            .filter(Boolean)
            .join(", ") || "-"}
        </div>
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">
        {calculateJobFormulas(job).weekEndingStr || "-"}
      </TableCell>
      <TableCell>
        {canEdit ? (
          <div className="relative flex items-center w-fit">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={displaySpoilage}
              onChange={(e) => handleSpoilageChange(e.target.value)}
              onBlur={() => handleBlur("spoilage")}
              className="w-24 bg-card border-input focus-visible:ring-ring font-mono text-right pr-7 h-8"
            />
            <span className="absolute right-2.5 text-muted-foreground text-xs font-mono select-none">
              %
            </span>
          </div>
        ) : (
          <span className="font-mono">{job.spoilagePercent}%</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Checkbox
            id={`reprint-${job.id}`}
            checked={displayReprint}
            disabled={!canEdit}
            onCheckedChange={(checked) => handleReprintChange(!!checked)}
          />
          {job.reprintRequired && (
            <Badge
              variant="outline"
              className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px] py-0"
            >
              <RefreshCw className="size-2 shrink-0 animate-spin" /> Reprinting
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        {canEdit ? (
          <Input
            value={displayNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            onBlur={() => handleBlur("notes")}
            placeholder="Add quality notes..."
            className="max-w-md bg-card border-input focus-visible:ring-ring h-8"
          />
        ) : (
          <span
            className="text-muted-foreground text-xs block max-w-[200px] truncate"
            title={job.notes || undefined}
          >
            {job.notes || "-"}
          </span>
        )}
      </TableCell>
    </TableRow>
  );
}
