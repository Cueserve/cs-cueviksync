import React from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/data-table";
import { TableEmptyState } from "@/components/ui/table-empty-state";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useDraggableScroll } from "@/hooks/use-draggable-scroll";
import { JobTableRow } from "./JobTableRow";
import { ColumnDateFilter } from "./ColumnDateFilter";
import type { JobWithItems } from "@/lib/types/jobs";
import type { calculateJobFormulas } from "@/lib/job-formulas";

type CalculatedJob = JobWithItems & ReturnType<typeof calculateJobFormulas>;

export interface JobsDateFilters {
  orderDate: { from: string; to: string };
  promisedDate: { from: string; to: string };
  completedDate: { from: string; to: string };
  deliveredDate: { from: string; to: string };
}

interface JobsTableProps {
  jobs: CalculatedJob[];
  canEdit: boolean;
  onDeleteJob: (id: string) => Promise<void>;
  currentSortKey: string;
  currentSortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  dateFilters: JobsDateFilters;
  onDateFilterChange: (
    updates: Record<string, string | null | undefined>,
  ) => void;
}

export function JobsTable({
  jobs,
  canEdit,
  onDeleteJob,
  currentSortKey,
  currentSortDirection,
  onSort,
  dateFilters,
  onDateFilterChange,
}: JobsTableProps) {
  const {
    ref: scrollRef,
    onMouseDown,
    onMouseLeave,
    onMouseUp,
    onMouseMove,
    isDragging,
  } = useDraggableScroll<HTMLDivElement>();

  return (
    <Table
      caption="Jobs Dashboard Pipeline"
      containerRef={scrollRef}
      containerProps={{
        onMouseDown,
        onMouseLeave,
        onMouseUp,
        onMouseMove,
        className: cn(
          "bg-card select-none",
          isDragging ? "cursor-grabbing" : "cursor-grab",
        ),
      }}
      className="whitespace-nowrap"
    >
      <TableHeader>
        <TableRow>
          <TableHead className="sticky left-0 min-w-[40px] max-w-[40px] w-[40px] px-2 bg-muted z-10"></TableHead>
          <SortableTableHead
            className="sticky left-10 bg-muted z-10 shadow-[2px_0_0_rgba(0,0,0,0.08)]"
            sortKey="jobNo"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            Job #
          </SortableTableHead>
          <TableHead className="text-center">Line #</TableHead>
          <TableHead>Item Description</TableHead>
          <TableHead className="text-center">Qty</TableHead>
          <TableHead>Status</TableHead>
          <SortableTableHead
            sortKey="orderDate"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            <span>Order Date</span>
            <ColumnDateFilter
              title="Order Date"
              from={dateFilters.orderDate.from}
              to={dateFilters.orderDate.to}
              onChange={(range) =>
                onDateFilterChange({
                  orderDateFrom: range.from || null,
                  orderDateTo: range.to || null,
                  page: "1",
                })
              }
            />
          </SortableTableHead>
          <SortableTableHead
            sortKey="promisedDate"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            <span>Promised Date</span>
            <ColumnDateFilter
              title="Promised Date"
              from={dateFilters.promisedDate.from}
              to={dateFilters.promisedDate.to}
              onChange={(range) =>
                onDateFilterChange({
                  promisedDateFrom: range.from || null,
                  promisedDateTo: range.to || null,
                  page: "1",
                })
              }
            />
          </SortableTableHead>
          <SortableTableHead
            sortKey="completedDate"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            <span>Completed Date</span>
            <ColumnDateFilter
              title="Completed Date"
              from={dateFilters.completedDate.from}
              to={dateFilters.completedDate.to}
              onChange={(range) =>
                onDateFilterChange({
                  completedDateFrom: range.from || null,
                  completedDateTo: range.to || null,
                  page: "1",
                })
              }
            />
          </SortableTableHead>
          <SortableTableHead
            sortKey="deliveredDate"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            <span>Delivered Date</span>
            <ColumnDateFilter
              title="Delivered Date"
              from={dateFilters.deliveredDate.from}
              to={dateFilters.deliveredDate.to}
              onChange={(range) =>
                onDateFilterChange({
                  deliveredDateFrom: range.from || null,
                  deliveredDateTo: range.to || null,
                  page: "1",
                })
              }
            />
          </SortableTableHead>
          <TableHead className="text-center">Items in Job</TableHead>
          <TableHead>Total Qty (Job)</TableHead>
          <SortableTableHead
            sortKey="invoiceValue"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            Invoice Value
          </SortableTableHead>
          <TableHead className="text-center">Turnaround (Days)</TableHead>
          <TableHead className="text-center">Days vs Promised</TableHead>
          <TableHead className="text-center">On-Time? (Y/N)</TableHead>
          <TableHead className="text-center">Overdue Flag</TableHead>
          <TableHead className="text-center">Days Overdue</TableHead>
          <TableHead className="text-center">Scheduled This Week</TableHead>
          <TableHead>Week Ending (Mon)</TableHead>
          <TableHead>Material Shortage?</TableHead>
          <TableHead>Equipment Issue</TableHead>
          <SortableTableHead
            sortKey="overdueReason"
            currentSortKey={currentSortKey}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          >
            Overdue Reason
          </SortableTableHead>
          <TableHead className="sticky right-0 bg-muted z-10 shadow-[-2px_0_0_rgba(0,0,0,0.08)]">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.length === 0 ? (
          <TableEmptyState
            colSpan={23}
            message="No jobs match the active filter."
          />
        ) : (
          jobs.map((job) => (
            <JobTableRow
              key={job.id}
              job={job}
              canEdit={canEdit}
              onDeleteJob={onDeleteJob}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
}
