import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function AdminPageHeader({
  title,
  description,
  backTo,
  backLabel = 'Geri',
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-3 border-b border-[rgb(var(--admin-border))] pb-4 sm:flex-row sm:items-start sm:justify-between',
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {backTo ? (
          <Link
            to={backTo}
            className="mb-1 inline-flex items-center gap-1.5 text-xs font-medium text-[rgb(var(--admin-text-muted))] transition-colors hover:text-[rgb(var(--admin-primary))]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {backLabel}
          </Link>
        ) : null}
        <h1 className="text-xl font-semibold tracking-tight text-[rgb(var(--admin-text))]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm text-[rgb(var(--admin-text-muted))]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
