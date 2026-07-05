import { cn } from '@/shared/lib/cn';
import { AdminPageHeader } from './AdminPageHeader';

interface AdminFormLayoutProps {
  title: string;
  description?: string;
  backTo: string;
  backLabel?: string;
  headerActions?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function AdminFormLayout({
  title,
  description,
  backTo,
  backLabel,
  headerActions,
  sidebar,
  children,
  footer,
  className,
}: AdminFormLayoutProps) {
  return (
    <div className={cn('admin-page pb-8', className)}>
      <AdminPageHeader
        title={title}
        description={description}
        backTo={backTo}
        backLabel={backLabel}
        actions={headerActions}
      />
      <div
        className={cn(
          'mt-6 grid gap-6',
          sidebar ? 'lg:grid-cols-[1fr_280px]' : 'max-w-4xl',
        )}
      >
        <div className="space-y-5">{children}</div>
        {sidebar ? <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">{sidebar}</aside> : null}
      </div>
      {footer}
    </div>
  );
}
