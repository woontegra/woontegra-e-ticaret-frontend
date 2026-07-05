import type { LucideIcon } from 'lucide-react';
import { Card } from '@/shared/ui';

interface MetricCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

export function MetricCard({ label, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 truncate text-lg font-semibold text-slate-900">
            {value}
          </p>
          {hint ? (
            <p className="mt-0.5 text-[10px] text-slate-400">{hint}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="rounded-md bg-slate-100 p-2 text-slate-600">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
