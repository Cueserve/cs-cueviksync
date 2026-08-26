"use client";

import React, { useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { useTracker } from "@/components/providers/tracker-provider";
import { useJobMetrics } from "@/hooks/use-job-metrics";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/data-table";
import { WasteDialog } from "@/components/dialogs/waste-dialog";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useSort, SortConfig } from "@/hooks/use-sort";
import { calculateJobFormulas } from "@/lib/job-formulas";
import { WasteTableRow } from "./_components/WasteTableRow";

export default function WasteReworkPage() {
  const { jobs, updateJob, selectedRole } = useTracker();
  const canEdit =
    selectedRole === "admin" ||
    selectedRole === "manager" ||
    selectedRole === "operator";

  // Dialog state for manually adding/logging waste
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenLog = () => {
    setIsLogOpen(true);
  };

  // Total metrics
  const { avgSpoilage, reprintCount } = useJobMetrics(jobs);

  const wasteJobs = jobs.filter((job) => {
    if (!(job.spoilagePercent > 0 || job.reprintRequired)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesJobNo = job.jobNo.toLowerCase().includes(q);
      const matchesDesc = job.items.some((i) =>
        i.itemDescription?.toLowerCase().includes(q),
      );
      if (!matchesJobNo && !matchesDesc) return false;
    }
    return true;
  });

  const sortConfigs: SortConfig<(typeof wasteJobs)[0]>[] = [
    {
      key: "weekEnding",
      getValue: (job) => {
        const { weekEndingStr } = calculateJobFormulas(job);
        return weekEndingStr ? new Date(weekEndingStr).getTime() : 0;
      },
    },
    { key: "spoilagePercent", getValue: (job) => job.spoilagePercent },
    { key: "jobNo", getValue: (job) => job.jobNo },
    {
      key: "description",
      getValue: (job) =>
        job.items
          .map((i) => i.itemDescription)
          .filter(Boolean)
          .join(", "),
    },
    { key: "reprint", getValue: (job) => (job.reprintRequired ? 1 : 0) },
    { key: "notes", getValue: (job) => job.notes || "" },
  ];

  const { sortKey, sortDirection, onSort, sortedData } = useSort(
    wasteJobs,
    sortConfigs,
    "weekEnding", // Default sort
    "desc",
  );

  const {
    page,
    size,
    onPageChange,
    onSizeChange,
    pageCount,
    paginatedData: paginatedWasteJobs,
  } = usePagination(sortedData, 25);

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
        <MetricCard
          title="Average Spoilage Rate"
          value={`${avgSpoilage}%`}
          valueClassName="text-warning"
        />
        <MetricCard
          title="Reprint Jobs Flagged"
          value={reprintCount}
          valueClassName="text-destructive"
        />
      </div>

      {/* Search Bar */}
      <div className="mt-6 flex justify-between items-end">
        <SearchInput
          placeholder="Search waste/rework..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[250px]"
        />
      </div>

      <div className="mt-4 bg-card rounded-md">
        <Table caption="Waste and Rework Log">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="jobNo"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Job #
              </SortableTableHead>
              <SortableTableHead
                sortKey="description"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Description
              </SortableTableHead>
              <SortableTableHead
                sortKey="weekEnding"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Week Ending (Mon)
              </SortableTableHead>
              <SortableTableHead
                sortKey="spoilagePercent"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Spoilage %
              </SortableTableHead>
              <SortableTableHead
                sortKey="reprint"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Reprint? (Y/N)
              </SortableTableHead>
              <SortableTableHead
                sortKey="notes"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Notes
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedWasteJobs.length === 0 ? (
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
              paginatedWasteJobs.map((job) => (
                <WasteTableRow
                  key={job.id}
                  job={job}
                  canEdit={canEdit}
                  onUpdateJob={updateJob}
                />
              ))
            )}
          </TableBody>
        </Table>
        {wasteJobs.length > 0 && (
          <div className="mt-4 px-2 mb-4">
            <Pagination
              page={page}
              pageCount={pageCount}
              size={size}
              onPageChange={onPageChange}
              onSizeChange={onSizeChange}
            />
          </div>
        )}
      </div>

      {/* Manual Waste / Rework Logging Dialog */}
      <WasteDialog open={isLogOpen} onOpenChange={setIsLogOpen} />
    </PageBody>
  );
}
