import { useState, useMemo } from "react";

export function usePagination<T>(data: T[], initialSize: number = 25) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState<number>(initialSize);

  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(data.length / size));
  }, [data.length, size]);

  // Keep page within valid bounds safely without render-time setState or effect cascading
  const safePage = Math.min(Math.max(1, page), pageCount);

  const paginatedData = useMemo(() => {
    const start = (safePage - 1) * size;
    return data.slice(start, start + size);
  }, [data, safePage, size]);

  return {
    page: safePage,
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
