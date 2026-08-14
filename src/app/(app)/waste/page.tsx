"use client";

import React, { useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { useTracker } from "@/components/providers/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { WasteDialog } from "@/components/dialogs/waste-dialog";

import { getWeekEndingMonday, formatDateUS } from "@/lib/date-utils";

export default function WasteReworkPage() {
  const { jobs, updateJobItem, selectedRole } = useTracker();
  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "manager" ||
    selectedRole === "operator";

  // State to hold temporary input modifications before save/blur
  const [editingValues, setEditingValues] = useState<
    Record<string, { spoilage: string; reprint: boolean; notes: string }>
  >({});

  // Dialog state for manually adding/logging waste
  const [isLogOpen, setIsLogOpen] = useState(false);

  const handleSpoilageChange = (id: string, val: string) => {
    const job = jobs.find((j) => j.id === id);
    setEditingValues((prev) => ({
      ...prev,
      [id]: {
        spoilage: val,
        reprint: prev[id]?.reprint ?? (job?.reprintRequired || false),
        notes: prev[id]?.notes ?? (job?.notes || ""),
      },
    }));
  };

  const handleReprintChange = (id: string, checked: boolean) => {
    const job = jobs.find((j) => j.id === id);
    setEditingValues((prev) => ({
      ...prev,
      [id]: {
        spoilage:
          prev[id]?.spoilage ?? (job?.spoilagePercent.toString() || "0"),
        reprint: checked,
        notes: prev[id]?.notes ?? (job?.notes || ""),
      },
    }));
    // Save reprint immediately
    updateJobItem(id, { reprintRequired: checked });
  };

  const handleNotesChange = (id: string, val: string) => {
    const job = jobs.find((j) => j.id === id);
    setEditingValues((prev) => ({
      ...prev,
      [id]: {
        spoilage:
          prev[id]?.spoilage ?? (job?.spoilagePercent.toString() || "0"),
        reprint: prev[id]?.reprint ?? (job?.reprintRequired || false),
        notes: val,
      },
    }));
  };

  const handleBlur = (id: string, field: "spoilage" | "notes") => {
    const edit = editingValues[id];
    if (edit) {
      if (field === "spoilage") {
        const parsed = parseFloat(edit.spoilage);
        const cleanedVal = isNaN(parsed)
          ? 0
          : Math.max(0, Math.min(100, parsed));
        updateJobItem(id, { spoilagePercent: cleanedVal });
      } else if (field === "notes") {
        updateJobItem(id, { notes: edit.notes });
      }
    }
  };

  const handleOpenLog = () => {
    setIsLogOpen(true);
  };

  // Total metrics
  const avgSpoilage =
    jobs.length > 0
      ? (
          jobs.reduce((sum, j) => sum + j.spoilagePercent, 0) / jobs.length
        ).toFixed(2)
      : "0.00";
  const reprintCount = jobs.filter((j) => j.reprintRequired).length;

  const wasteJobs = jobs.filter(
    (job) => job.spoilagePercent > 0 || job.reprintRequired,
  );

  return (
    <PageBody>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Waste / Rework Log"
          description="Placeholder tracking — spoilage % formula to be defined once we have enough data (flagged by Hitesh)."
        />
        {canEdit && (
          <Button
            onClick={handleOpenLog}
            className="gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shrink-0"
          >
            <Plus className="size-4" /> Log Waste / Rework
          </Button>
        )}
      </div>

      {/* Highlights Grid */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground">
            Average Spoilage Rate
          </div>
          <div className="text-2xl font-semibold mt-1 font-mono text-warning">
            {avgSpoilage}%
          </div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <div className="text-xs font-medium text-muted-foreground">
            Reprint Jobs Flagged
          </div>
          <div className="text-2xl font-semibold mt-1 font-mono text-destructive">
            {reprintCount}
          </div>
        </div>
      </div>

      <div className="mt-6 bg-card rounded-md">
        <Table caption="Waste and Rework Log">
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Week Ending (Mon)</TableHead>
              <TableHead>Spoilage %</TableHead>
              <TableHead>Reprint? (Y/N)</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wasteJobs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No waste or rework recorded. Use the &quot;Log Waste /
                  Rework&quot; button or edit a job in the Job Master to log
                  issues.
                </TableCell>
              </TableRow>
            ) : (
              wasteJobs.map((job) => {
                const currentEdit = editingValues[job.id];
                const displaySpoilage =
                  currentEdit !== undefined
                    ? currentEdit.spoilage
                    : job.spoilagePercent.toString();
                const displayReprint =
                  currentEdit !== undefined
                    ? currentEdit.reprint
                    : job.reprintRequired;
                const displayNotes =
                  currentEdit !== undefined
                    ? currentEdit.notes
                    : job.notes || "";

                return (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.jobNo}</TableCell>
                    <TableCell>
                      <div
                        className="max-w-[250px] truncate"
                        title={job.itemDescription}
                      >
                        {job.itemDescription}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {job.completedDate
                        ? formatDateUS(getWeekEndingMonday(job.completedDate))
                        : "-"}
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
                            onChange={(e) =>
                              handleSpoilageChange(job.id, e.target.value)
                            }
                            onBlur={() => handleBlur(job.id, "spoilage")}
                            className="w-24 bg-card border-input focus-visible:ring-ring font-mono text-right pr-7 h-8"
                          />
                          <span className="absolute right-2.5 text-muted-foreground text-xs font-mono select-none">
                            %
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono">
                          {job.spoilagePercent}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`reprint-${job.id}`}
                          checked={displayReprint}
                          disabled={!canEdit}
                          onCheckedChange={(checked) =>
                            handleReprintChange(job.id, !!checked)
                          }
                        />
                        {job.reprintRequired && (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20 gap-1 text-[10px] py-0"
                          >
                            <RefreshCw className="size-2 shrink-0 animate-spin" />{" "}
                            Reprinting
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {canEdit ? (
                        <Input
                          value={displayNotes}
                          onChange={(e) =>
                            handleNotesChange(job.id, e.target.value)
                          }
                          onBlur={() => handleBlur(job.id, "notes")}
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
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Manual Waste / Rework Logging Dialog */}
      <WasteDialog open={isLogOpen} onOpenChange={setIsLogOpen} />
    </PageBody>
  );
}
