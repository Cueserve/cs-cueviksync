"use client";

import React, { useState } from "react";
import { RefreshCw } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { useTracker } from "@/components/providers/tracker-provider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

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

  // Total metrics
  const avgSpoilage =
    jobs.length > 0
      ? (
          jobs.reduce((sum, j) => sum + j.spoilagePercent, 0) / jobs.length
        ).toFixed(2)
      : "0.00";
  const reprintCount = jobs.filter((j) => j.reprintRequired).length;

  return (
    <PageBody>
      <PageHeader
        title="Waste / Rework Log"
        description="Placeholder tracking — spoilage % formula to be defined once we have enough data (flagged by Hitesh)."
      />

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

      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm whitespace-nowrap">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-4 font-semibold">Job #</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Week Ending (Mon)</th>
              <th className="p-4 font-semibold">Spoilage %</th>
              <th className="p-4 font-semibold">Reprint? (Y/N)</th>
              <th className="p-4 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {jobs.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-muted-foreground"
                >
                  No jobs logged in the system. Create jobs in the Job Master
                  first.
                </td>
              </tr>
            ) : (
              jobs.map((job) => {
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
                  <tr
                    key={job.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="p-4 font-medium">{job.jobNo}</td>
                    <td className="p-4">{job.itemDescription}</td>
                    <td className="p-4 font-mono text-muted-foreground">
                      {job.completedDate
                        ? formatDateUS(getWeekEndingMonday(job.completedDate))
                        : "-"}
                    </td>
                    <td className="p-4">
                      {canEdit ? (
                        <div className="relative flex items-center">
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
                            className="w-24 bg-card border-input focus-visible:ring-ring font-mono text-right pr-6"
                          />
                          <span className="absolute right-8 text-muted-foreground text-xs font-mono select-none">
                            %
                          </span>
                        </div>
                      ) : (
                        <span className="font-mono">
                          {job.spoilagePercent}%
                        </span>
                      )}
                    </td>
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      {canEdit ? (
                        <Input
                          value={displayNotes}
                          onChange={(e) =>
                            handleNotesChange(job.id, e.target.value)
                          }
                          onBlur={() => handleBlur(job.id, "notes")}
                          placeholder="Add quality notes..."
                          className="max-w-md bg-card border-input focus-visible:ring-ring"
                        />
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          {job.notes || "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </PageBody>
  );
}
