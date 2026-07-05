import { cn } from '@/shared/lib/cn';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md';
}

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
};

export function Card({ children, className, padding = 'sm' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-slate-200 bg-white',
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="mb-2 flex items-start justify-between gap-2">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
