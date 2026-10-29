import { useEffect, useState } from "react";

const DEFAULT_PAGE_SIZE = 20;

export function usePaginatedList<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const loadMore = () => {
    if (hasMore) setVisibleCount((count) => Math.min(count + pageSize, items.length));
  };

  return { visibleItems, hasMore, loadMore };
}
