"use client";

import React, { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import {
  useTracker,
  type JobItem,
} from "@/components/providers/tracker-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody,
} from "@/components/ui/dialog";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { IssueBadge } from "@/components/ui/issue-badge";

export default function ThisWeekSchedulePage() {
  const { jobs, updateJobItem, selectedRole } = useTracker();
  const scheduledJobs = jobs.filter((job) => job.inThisWeek);

  const [activeJob, setActiveJob] = useState<JobItem | null>(null);
  const [materialShortage, setMaterialShortage] = useState("");
  const [equipmentIssue, setEquipmentIssue] = useState("");

  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "manager" ||
    selectedRole === "operator";

  const handleOpenEdit = (job: JobItem) => {
    if (!canEdit) return; // ← block non-editors even if called directly
    setActiveJob(job);
    setMaterialShortage(job.materialShortage);
    setEquipmentIssue(job.equipmentIssue);
  };

  const handleSave = () => {
    if (!canEdit || !activeJob) return; // ← double-guard on save too
    updateJobItem(activeJob.id, {
      materialShortage,
      equipmentIssue,
    });
    setActiveJob(null);
  };

  return (
    <PageBody>
      <PageHeader
        title="This Week Schedule"
        description="Read-only view. Flag a job 'Y' in the 'In This Week?' column on Job Master — every item line of that job appears here."
      />

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="p-4 font-semibold">Job #</th>
              <th className="p-4 font-semibold">Item Description</th>
              <th className="p-4 font-semibold">Qty</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Material Shortage?</th>
              <th className="p-4 font-semibold">Equipment Issue</th>
              {canEdit && (
                <th className="p-4 font-semibold text-right">Triage</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {scheduledJobs.length === 0 ? (
              <TableEmptyState
                colSpan={7}
                message="No jobs scheduled for this week. Flag items in the Job Master to see them here."
              />
            ) : (
              scheduledJobs.map((job) => {
                // Find if the parent job is completed
                const parentJob = jobs.find(
                  (j) => j.jobNo === job.jobNo && j.lineNo === 1,
                );
                const isCompleted = !!parentJob?.completedDate;

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <td className="p-4 font-medium">{job.jobNo}</td>
                    <td className="p-4">{job.itemDescription}</td>
                    <td className="p-4 font-mono">
                      {job.quantity.toLocaleString()}
                    </td>
                    <td className="p-4">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <IssueBadge type="material" text={job.materialShortage} />
                    </td>
                    <td className="p-4">
                      <IssueBadge type="equipment" text={job.equipmentIssue} />
                    </td>
                    {canEdit && (
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(job)}
                          className="text-xs"
                        >
                          Update status
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Status Dialog */}
      <Dialog
        open={!!activeJob}
        onOpenChange={(open) => !open && setActiveJob(null)}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Weekly Issue Logs</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="matShortage"
                className="text-right text-sm font-medium"
              >
                Material Shortage
              </label>
              <Input
                id="matShortage"
                value={materialShortage}
                onChange={(e) => setMaterialShortage(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Awaiting paper shipment"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label
                htmlFor="eqIssue"
                className="text-right text-sm font-medium"
              >
                Equip. Issue
              </label>
              <Input
                id="eqIssue"
                value={equipmentIssue}
                onChange={(e) => setEquipmentIssue(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Press #2 out of alignment"
              />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveJob(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              Save Logs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageBody>
  );
}
