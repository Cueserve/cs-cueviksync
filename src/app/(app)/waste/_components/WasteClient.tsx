"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { SearchInput } from "@/components/ui/search-input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/data-table";
import { WasteDialog } from "@/components/dialogs/waste-dialog";
import { Pagination } from "@/components/ui/pagination";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { WasteTableRow } from "./WasteTableRow";
import { updateJob } from "@/server/actions/jobs";
import { canEditJobs } from "@/lib/permissions";
import type { JobWithItems } from "@/lib/types/jobs";
import type { Database } from "@/lib/supabase/types";

type JobUpdate = Database["public"]["Tables"]["jobs"]["Update"];

interface WasteClientProps {
  jobs: JobWithItems[];
  allJobsForDialog: JobWithItems[];
  userRole: string | null;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  avgSpoilage: string;
  reprintCount: number;
}

export default function WasteClient({
  jobs,
  allJobsForDialog,
  userRole,
  totalCount,
  currentPage,
  pageSize,
  avgSpoilage,
  reprintCount,
}: WasteClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canEdit = canEditJobs(userRole);

  const handleUpdateJob = async (id: string, updates: JobUpdate) => {
    await updateJob(id, updates);
  };

  // Dialog state for manually adding/logging waste
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Search state with debouncing to URL
  const currentSearchInUrl = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(currentSearchInUrl);
  const lastUpdatedFromUrl = useRef(currentSearchInUrl);

  useEffect(() => {
    if (currentSearchInUrl !== lastUpdatedFromUrl.current) {
      setSearchQuery(currentSearchInUrl);
      lastUpdatedFromUrl.current = currentSearchInUrl;
    }
  }, [currentSearchInUrl]);

  const updateFilters = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      }
      router.push(`${pathname}?${current.toString()}`);
    },
    [router, pathname, searchParams],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      lastUpdatedFromUrl.current = searchQuery;
      const currentInUrl = searchParams.get("search") || "";
      if (searchQuery !== currentInUrl) {
        updateFilters({ search: searchQuery || null, page: "1" });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [searchQuery, searchParams, updateFilters]);

  const currentSortKey = searchParams.get("sortBy") || "spoilagePercent";
  const currentSortDirection =
    (searchParams.get("sortDir") as "asc" | "desc") || "desc";

  const handleSort = (key: string) => {
    const nextDir =
      currentSortKey === key && currentSortDirection === "desc"
        ? "asc"
        : "desc";
    updateFilters({
      sortBy: key,
      sortDir: nextDir,
      page: "1",
    });
  };

  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <PageBody>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Waste / Rework Log"
          description="Placeholder tracking — spoilage % formula to be defined once we have enough data."
        />
        {canEdit && (
          <Button
            onClick={() => setIsLogOpen(true)}
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
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Job #
              </SortableTableHead>
              <TableHead>Description</TableHead>
              <TableHead>Week Ending (Mon)</TableHead>
              <SortableTableHead
                sortKey="spoilagePercent"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Spoilage %
              </SortableTableHead>
              <SortableTableHead
                sortKey="reprintRequired"
                currentSortKey={currentSortKey}
                currentSortDirection={currentSortDirection}
                onSort={handleSort}
              >
                Reprint? (Y/N)
              </SortableTableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
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
              jobs.map((job) => (
                <WasteTableRow
                  key={job.id}
                  job={job}
                  canEdit={canEdit}
                  onUpdateJob={handleUpdateJob}
                />
              ))
            )}
          </TableBody>
        </Table>
        {totalCount > 0 && (
          <div className="mt-4 px-2 mb-4">
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              size={pageSize}
              onPageChange={(newPage) =>
                updateFilters({ page: newPage.toString() })
              }
              onSizeChange={(newSize) =>
                updateFilters({ size: newSize.toString(), page: "1" })
              }
            />
          </div>
        )}
      </div>

      {/* Manual Waste / Rework Logging Dialog */}
      <WasteDialog
        open={isLogOpen}
        onOpenChange={setIsLogOpen}
        jobs={allJobsForDialog}
      />
    </PageBody>
  );
}
