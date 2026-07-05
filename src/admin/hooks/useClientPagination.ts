import { useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 20;

export function useClientPagination<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  const setPageSafe = (next: number) => {
    setPage(Math.max(1, Math.min(next, totalPages)));
  };

  return {
    page: safePage,
    setPage: setPageSafe,
    totalPages,
    total,
    pageSize,
    items: paginatedItems,
    resetPage: () => setPage(1),
  };
}
