import { cn } from '@/shared/lib/cn';
import { AdminPageHeader } from './AdminPageHeader';

interface ListPageShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function ListPageShell({
  title,
  description,
  actions,
  filters,
  footer,
  children,
  className,
}: ListPageShellProps) {
  return (
    <div className={cn('admin-page space-y-4', className)}>
      <AdminPageHeader title={title} description={description} actions={actions} />
      <section className="overflow-hidden rounded-lg border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] shadow-[var(--admin-shadow-sm)]">
        {filters ? (
          <div className="border-b border-[rgb(var(--admin-border-subtle))] bg-[rgb(var(--admin-surface-muted))] px-4 py-3">
            {filters}
          </div>
        ) : null}
        <div className="overflow-x-auto">{children}</div>
        {footer}
      </section>
    </div>
  );
}
