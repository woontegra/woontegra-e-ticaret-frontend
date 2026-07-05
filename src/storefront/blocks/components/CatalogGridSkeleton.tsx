interface CatalogGridSkeletonProps {
  columns: number;
  count: number;
  horizontal?: boolean;
}

export function CatalogGridSkeleton({
  columns,
  count,
  horizontal = false,
}: CatalogGridSkeletonProps) {
  const items = Array.from({ length: count });

  if (horizontal) {
    return (
      <div className="flex gap-4 overflow-hidden" aria-hidden>
        {items.map((_, index) => (
          <div key={index} className="w-56 shrink-0 space-y-3">
            <div className="aspect-square animate-pulse rounded-lg bg-slate-100" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid w-full gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {items.map((_, index) => (
        <div key={index} className="space-y-3">
          <div className="aspect-square animate-pulse rounded-lg bg-slate-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}
