import * as React from "react";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

interface SortableTableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  sortKey: string;
  currentSortKey: string | null;
  currentSortDirection: "asc" | "desc";
  onSort: (key: string) => void;
  children: React.ReactNode;
}

export function SortableTableHead({
  sortKey,
  currentSortKey,
  currentSortDirection,
  onSort,
  children,
  className,
  ...props
}: SortableTableHeadProps) {
  const isSorted = currentSortKey === sortKey;

  return (
    <TableHead
      className={cn(
        "group cursor-pointer select-none hover:bg-muted/50 transition-colors",
        className,
      )}
      onClick={() => onSort(sortKey)}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-1",
          className?.includes("text-center") && "justify-center",
        )}
      >
        {children}
        <span className="flex-shrink-0 text-muted-foreground">
          {isSorted ? (
            currentSortDirection === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : (
              <ArrowDown className="size-3.5" />
            )
          ) : (
            <ArrowUpDown className="size-3.5 opacity-30 group-hover:opacity-100 transition-opacity" />
          )}
        </span>
      </div>
    </TableHead>
  );
}
