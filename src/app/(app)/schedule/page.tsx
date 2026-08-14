"use client";

import React, { useState } from "react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import {
  useTracker,
  type JobItem,
} from "@/components/providers/tracker-provider";
import { Button } from "@/components/ui/button";
import { IssueDialog } from "@/components/dialogs/issue-dialog";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { IssueBadge } from "@/components/ui/issue-badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/data-table";
import { formatDateUS } from "@/lib/date-utils";

export default function ThisWeekSchedulePage() {
  const { jobs, selectedRole } = useTracker();
  const scheduledJobs = jobs.filter((job) => job.inThisWeek);

  const [activeJob, setActiveJob] = useState<JobItem | null>(null);

  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "manager" ||
    selectedRole === "operator";

  const handleOpenEdit = (job: JobItem) => {
    if (!canEdit) return; // ← block non-editors even if called directly
    setActiveJob(job);
  };

  return (
    <PageBody>
      <PageHeader
        title="This Week Schedule"
        description="Read-only view. Flag a job 'Y' in the 'In This Week?' column on Job Master — every item line of that job appears here."
      />

      <div className="mt-6 bg-card rounded-md">
        <Table caption="This week's scheduled jobs">
          <TableHeader>
            <TableRow>
              <TableHead>Job #</TableHead>
              <TableHead>Item Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Promised Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Material Shortage?</TableHead>
              <TableHead>Equipment Issue</TableHead>
              {canEdit && <TableHead className="text-right">Triage</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduledJobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="p-0">
                  <TableEmptyState
                    colSpan={1}
                    message="No jobs scheduled for this week. Flag items in the Job Master to see them here."
                  />
                </TableCell>
              </TableRow>
            ) : (
              scheduledJobs.map((job) => {
                // Find if the parent job is completed
                const parentJob = jobs.find(
                  (j) => j.jobNo === job.jobNo && j.lineNo === 1,
                );
                const isCompleted = !!parentJob?.completedDate;

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
                    <TableCell numeric>
                      {job.quantity.toLocaleString()}
                    </TableCell>
                    <TableCell numeric>
                      {job.orderDate ? formatDateUS(job.orderDate) : "-"}
                    </TableCell>
                    <TableCell numeric>
                      {job.promisedDate ? formatDateUS(job.promisedDate) : "-"}
                    </TableCell>
                    <TableCell>
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 rounded bg-success/10 px-2 py-1 text-xs font-semibold text-success">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-warning/10 px-2 py-1 text-xs font-semibold text-warning">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IssueBadge type="material" text={job.materialShortage} />
                    </TableCell>
                    <TableCell>
                      <IssueBadge type="equipment" text={job.equipmentIssue} />
                    </TableCell>
                    {canEdit && (
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEdit(job)}
                          className="text-xs"
                        >
                          Update status
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Status Dialog */}
      <IssueDialog
        activeJob={activeJob}
        onOpenChange={(open) => {
          if (!open) setActiveJob(null);
        }}
        canEdit={canEdit}
      />
    </PageBody>
  );
}
