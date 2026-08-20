import { useState, useMemo } from "react";

export type SortDirection = "asc" | "desc";

export interface SortConfig<T> {
  key: string;
  // A function to extract the value used for sorting
  getValue: (item: T) => number | string | Date | null | undefined;
}

export function useSort<T>(
  data: T[],
  configs: SortConfig<T>[],
  initialSortKey: string | null = null,
  initialSortDirection: SortDirection = "desc",
) {
  const [sortKey, setSortKey] = useState<string | null>(initialSortKey);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(initialSortDirection);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc"); // Default to desc on new sort
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const config = configs.find((c) => c.key === sortKey);
    if (!config) return data;

    return [...data].sort((a, b) => {
      const valA = config.getValue(a);
      const valB = config.getValue(b);

      if (valA === valB) return 0;

      // Handle null/undefined (push to end)
      if (valA == null) return 1;
      if (valB == null) return -1;

      // Handle dates
      if (valA instanceof Date && valB instanceof Date) {
        return sortDirection === "asc"
          ? valA.getTime() - valB.getTime()
          : valB.getTime() - valA.getTime();
      }

      // Handle strings and numbers
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;

      return 0;
    });
  }, [data, sortKey, sortDirection, configs]);

  return {
    sortKey,
    sortDirection,
    onSort: handleSort,
    sortedData,
  };
}
