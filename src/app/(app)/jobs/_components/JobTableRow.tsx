import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";

import { cn, formatMoney } from "@/lib/utils";
import { formatDateUS } from "@/lib/date-utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { IssueBadge } from "@/components/ui/issue-badge";
import { TableRow, TableCell } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { JobWithItems } from "@/lib/types/jobs";
import { calculateJobFormulas } from "@/lib/job-formulas";

// The job object passed here is already decorated with formula results
type CalculatedJob = JobWithItems & ReturnType<typeof calculateJobFormulas>;

interface JobTableRowProps {
  job: CalculatedJob;
  canEdit: boolean;
  onDeleteJob: (id: string) => void;
}

export function JobTableRow({ job, canEdit, onDeleteJob }: JobTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isArchived = !!job.deleted_at;

  const {
    statusStr,
    weekEndingStr,
    turnaroundDaysVal,
    daysVsPromisedVal,
    onTimeVal,
    overdueFlagVal,
    daysOverdueVal,
    scheduledThisWeekVal,
    itemsInJob,
    totalQty,
  } = job;

  type DisplayItem = {
    id: string;
    lineNo: number | string;
    itemDescription: string;
    quantity: number | string;
    materialShortage?: string | null;
    equipmentIssue?: string | null;
  };

  const hasMultipleItems = itemsInJob > 1;
  const visibleItems: DisplayItem[] = isExpanded
    ? job.items
    : job.items && job.items.length > 0
      ? [job.items[0]]
      : [
          {
            id: "dummy",
            lineNo: "-",
            itemDescription: "No items",
            quantity: "-",
            materialShortage: null,
            equipmentIssue: null,
          },
        ];

  return (
    <React.Fragment>
      {visibleItems.map((item, idx) => {
        const isFirst = idx === 0;
        return (
          <TableRow key={item.id} className={cn(!isFirst && "bg-muted/30")}>
            <TableCell className="sticky left-0 bg-background z-10 min-w-[40px] max-w-[40px] w-[40px] px-2 text-center">
              {isFirst && hasMultipleItems ? (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 hover:bg-muted rounded text-muted-foreground"
                >
                  {isExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </button>
              ) : null}
            </TableCell>
            <TableCell className="sticky left-10 bg-background z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)] font-medium">
              {isFirst ? (
                <Link
                  href={`/jobs/${job.jobNo}`}
                  className="text-primary hover:underline"
                >
                  {job.jobNo}
                </Link>
              ) : (
                <div className="pl-2 text-muted-foreground border-l-2 border-muted-foreground/30 ml-2"></div>
              )}
            </TableCell>
            <TableCell className="text-center">{item.lineNo}</TableCell>
            <TableCell
              className="max-w-[200px] truncate"
              title={item.itemDescription}
            >
              {item.itemDescription}
            </TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell>
              {isFirst ? (
                statusStr.toLowerCase() === "completed" ? (
                  <span className="inline-flex items-center rounded bg-success/20 px-2 py-0.5 text-[10px] font-semibold text-success uppercase tracking-wider">
                    Completed
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded bg-warning/20 px-2 py-0.5 text-[10px] font-semibold text-warning uppercase tracking-wider">
                    Pending
                  </span>
                )
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>
              {isFirst ? formatDateUS(job.orderDate) || "-" : "-"}
            </TableCell>
            <TableCell>
              {isFirst ? formatDateUS(job.promisedDate) || "-" : "-"}
            </TableCell>
            <TableCell>
              {isFirst ? formatDateUS(job.completedDate) || "-" : "-"}
            </TableCell>
            <TableCell>
              {isFirst ? formatDateUS(job.deliveredDate) || "-" : "-"}
            </TableCell>
            <TableCell className="text-center">
              {isFirst ? itemsInJob : "-"}
            </TableCell>
            <TableCell className="font-semibold">
              {isFirst ? totalQty : "-"}
            </TableCell>
            <TableCell>
              {isFirst && job.invoiceValue > 0
                ? formatMoney(job.invoiceValue)
                : "-"}
            </TableCell>
            <TableCell className="text-center">
              {isFirst
                ? turnaroundDaysVal !== ""
                  ? turnaroundDaysVal
                  : "-"
                : "-"}
            </TableCell>
            <TableCell className="text-center">
              {isFirst ? (
                daysVsPromisedVal !== "" ? (
                  <span
                    className={
                      typeof daysVsPromisedVal === "number"
                        ? daysVsPromisedVal > 0
                          ? "text-destructive"
                          : daysVsPromisedVal <= 0
                            ? "text-success"
                            : ""
                        : ""
                    }
                  >
                    {typeof daysVsPromisedVal === "number"
                      ? Math.abs(daysVsPromisedVal)
                      : daysVsPromisedVal}
                  </span>
                ) : (
                  "-"
                )
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell className="text-center">
              {isFirst && onTimeVal ? <StatusBadge value={onTimeVal} /> : "-"}
            </TableCell>
            <TableCell className="text-center">
              {isFirst && overdueFlagVal ? (
                <span
                  className={cn(
                    "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    overdueFlagVal === "Overdue"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {overdueFlagVal}
                </span>
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell
              className={cn(
                "text-center",
                isFirst && daysOverdueVal !== "" && Number(daysOverdueVal) > 0
                  ? "text-destructive font-bold"
                  : "",
              )}
            >
              {isFirst ? (daysOverdueVal !== "" ? daysOverdueVal : "-") : "-"}
            </TableCell>
            <TableCell className="text-center">
              {isFirst && scheduledThisWeekVal ? (
                <StatusBadge value={scheduledThisWeekVal} />
              ) : (
                "-"
              )}
            </TableCell>
            <TableCell>{isFirst ? weekEndingStr || "-" : "-"}</TableCell>
            <TableCell>
              {item.materialShortage ? (
                <IssueBadge type="material" text={item.materialShortage} />
              ) : (
                <IssueBadge type="material" text="No" />
              )}
            </TableCell>
            <TableCell>
              {item.equipmentIssue ? (
                <IssueBadge type="equipment" text={item.equipmentIssue} />
              ) : (
                <IssueBadge type="equipment" text="No" />
              )}
            </TableCell>
            <TableCell
              className="max-w-[200px] truncate"
              title={isFirst ? job.overdueReason || "" : ""}
            >
              {isFirst ? job.overdueReason || "-" : "-"}
            </TableCell>
            <TableCell className="sticky right-0 bg-background z-10 shadow-[-2px_0_0_rgba(0,0,0,0.08)]">
              {isFirst ? (
                <div className="flex items-center gap-2">
                  {canEdit ? (
                    <>
                      <Link
                        href={isArchived ? "#" : `/jobs/${job.jobNo}`}
                        className={cn(
                          "p-1.5 transition-colors",
                          isArchived
                            ? "text-muted-foreground/30 cursor-not-allowed pointer-events-none"
                            : "text-muted-foreground hover:text-primary",
                        )}
                        title={isArchived ? "Archived (View Only)" : "Edit Job"}
                      >
                        <Pencil className="size-4" />
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={isArchived}
                            className={cn(
                              "p-1.5 transition-colors",
                              isArchived
                                ? "text-muted-foreground/30 cursor-not-allowed"
                                : "text-muted-foreground hover:text-destructive",
                            )}
                            title={
                              isArchived
                                ? "Cannot delete archived job"
                                : "Delete Job"
                            }
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to archive Job {job.jobNo}?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteJob(job.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Archive Job
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Link
                      href={`/jobs/${job.jobNo}`}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors font-medium text-xs uppercase"
                      title="View Job"
                    >
                      View
                    </Link>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground/30">-</span>
              )}
            </TableCell>
          </TableRow>
        );
      })}
    </React.Fragment>
  );
}
