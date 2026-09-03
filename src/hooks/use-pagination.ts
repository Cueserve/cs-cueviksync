import { useState, useMemo } from "react";

export function usePagination<T>(data: T[], initialSize: number = 25) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<number>(initialSize);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / size));
  }, [data.length, size]);

  const paginatedData = useMemo(() => {
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
    onSizeChange: (newSize: number) => {
      setSize(newSize);
      setPage(1);
    },
    pageCount,
    paginatedData,
  };
}
