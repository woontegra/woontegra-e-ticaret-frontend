import { cn } from '@/shared/lib/cn';

interface AdminPanelProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** @deprecated Prefer ListPageShell for list screens */
export function AdminPanel({
  children,
  actions,
  filters,
  footer,
  className,
}: AdminPanelProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-lg border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] shadow-[var(--admin-shadow-sm)]',
        className,
      )}
    >
      {actions ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-[rgb(var(--admin-border-subtle))] px-4 py-3">
          {actions}
        </div>
      ) : null}
      {filters ? (
        <div className="border-b border-[rgb(var(--admin-border-subtle))] bg-[rgb(var(--admin-surface-muted))] px-4 py-3">
          {filters}
        </div>
      ) : null}
      {children}
      {footer}
    </section>
  );
}
