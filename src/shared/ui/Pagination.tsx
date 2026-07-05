import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1 && total === undefined) return null;

  const from = total && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const to =
    total && pageSize ? Math.min(page * pageSize, total) : undefined;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-3 py-2 text-xs text-slate-500',
        className,
      )}
    >
      <p>
        {total !== undefined && from !== undefined && to !== undefined
          ? `${from}–${to} / ${total}`
          : `${page} / ${totalPages}`}
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Önceki
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
}
