import { useState, useMemo } from "react";

export function usePagination<T>(data: T[], initialSize: number | "all" = 25) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<number | "all">(initialSize);

  const pageCount = useMemo(() => {
    if (size === "all") return 1;
    return Math.max(1, Math.ceil(data.length / size));
  }, [data.length, size]);

  const paginatedData = useMemo(() => {
    if (size === "all") return data;
    const start = (page - 1) * size;
    return data.slice(start, start + size);
  }, [data, page, size]);

  // Ensure page is valid when data length changes
  if (page > pageCount && pageCount > 0) {
    setPage(pageCount);
  }

  return {
    page,
    size,
    onPageChange: setPage,
    onSizeChange: (newSize: number | "all") => {
      setSize(newSize);
      setPage(1);
    },
    pageCount,
    paginatedData,
  };
}
