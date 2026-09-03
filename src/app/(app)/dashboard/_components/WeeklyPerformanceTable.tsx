import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { SortableTableHead } from "@/components/ui/sortable-table-head";
import { useSort, SortConfig } from "@/hooks/use-sort";
import { formatDateUS } from "@/lib/date-utils";
import { BarChart2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { WeeklyStat } from "@/hooks/use-job-metrics";

interface WeeklyPerformanceTableProps {
  weeklyStatsArray: WeeklyStat[];
}

export function WeeklyPerformanceTable({
  weeklyStatsArray,
}: WeeklyPerformanceTableProps) {
  const [onlyActiveWeeks, setOnlyActiveWeeks] = useState(true);

  const displayData = useMemo(() => {
    if (onlyActiveWeeks) {
      return weeklyStatsArray.filter((stat) => stat.completedCount > 0);
    }
    return weeklyStatsArray;
  }, [weeklyStatsArray, onlyActiveWeeks]);

  const sortConfigs: SortConfig<WeeklyStat>[] = [
    {
      key: "weekEnding",
      getValue: (item) => new Date(item.weekEnding).getTime(),
    },
    { key: "completedCount", getValue: (item) => item.completedCount },
    {
      key: "avgTurnaround",
      getValue: (item) =>
        item.completedCount > 0
          ? item.totalTurnaround / item.completedCount
          : 0,
    },
    {
      key: "onTimePercent",
      getValue: (item) =>
        item.completedCount > 0 ? item.onTimeCount / item.completedCount : 0,
    },
    { key: "invoiceSum", getValue: (item) => item.invoiceSum },
  ];

  const { sortKey, sortDirection, onSort, sortedData } = useSort(
    displayData,
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
    paginatedData: paginatedStats,
  } = usePagination(sortedData, 25);

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-md font-semibold flex items-center gap-2">
          <BarChart2 className="size-4 text-sidebar-primary" />
          Weekly Performance Trends
        </h3>
        <div className="flex items-center gap-2">
          <Switch
            id="only-active-weeks"
            checked={onlyActiveWeeks}
            onCheckedChange={setOnlyActiveWeeks}
          />
          <label
            htmlFor="only-active-weeks"
            className="text-xs font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors"
          >
            Only weeks with activity
          </label>
        </div>
      </div>
      <div className="bg-card rounded-md mt-2">
        <Table caption="Weekly Performance Trends">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                className="text-center"
                sortKey="weekEnding"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Week Ending (Mon)
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="completedCount"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Jobs Completed
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="avgTurnaround"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Avg Turnaround (Days)
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="onTimePercent"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                On-Time Delivery %
              </SortableTableHead>
              <SortableTableHead
                className="text-center"
                sortKey="invoiceSum"
                currentSortKey={sortKey}
                currentSortDirection={sortDirection}
                onSort={onSort}
              >
                Total Invoice Value
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-center">
            {paginatedStats.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground font-sans"
                >
                  No completed jobs found for the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedStats.map((stat) => {
                const avgTurnaround =
                  stat.completedCount > 0
                    ? (stat.totalTurnaround / stat.completedCount).toFixed(1)
                    : "-";
                const onTimePercent =
                  stat.completedCount > 0
                    ? `${Math.round((stat.onTimeCount / stat.completedCount) * 100)}%`
                    : "-";

                return (
                  <TableRow key={stat.weekEnding}>
                    <TableCell className="font-medium text-foreground">
                      {formatDateUS(stat.weekEnding)}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.completedCount}
                    </TableCell>
                    <TableCell className="text-center">
                      {avgTurnaround}
                    </TableCell>
                    <TableCell className="text-center">
                      {stat.completedCount > 0 && (
                        <span
                          className={
                            stat.onTimeCount / stat.completedCount >= 0.7
                              ? "text-success font-semibold"
                              : "text-destructive font-semibold"
                          }
                        >
                          {onTimePercent}
                        </span>
                      )}
                      {stat.completedCount === 0 && "-"}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground text-center">
                      ${stat.invoiceSum.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        {displayData.length > 0 && (
          <div className="mt-4 px-2 pb-4">
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
    </div>
  );
}
