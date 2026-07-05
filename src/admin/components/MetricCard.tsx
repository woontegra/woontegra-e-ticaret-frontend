import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

export function MetricCard({ label, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] p-4 shadow-[var(--admin-shadow-sm)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-[rgb(var(--admin-text-muted))]">
            {label}
          </p>
          <p className="mt-1 truncate text-xl font-semibold tracking-tight text-[rgb(var(--admin-text))]">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-[11px] text-[rgb(var(--admin-text-muted))]">
              {hint}
            </p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-lg bg-[rgb(var(--admin-primary))]/10 p-2.5 text-[rgb(var(--admin-primary))]">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
