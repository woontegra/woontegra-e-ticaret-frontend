import { cn } from '@/shared/lib/cn';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <section
      className={cn(
        'rounded-lg border border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-surface))] p-5 shadow-[var(--admin-shadow-sm)]',
        className,
      )}
    >
      <div className="mb-4 border-b border-[rgb(var(--admin-border-subtle))] pb-3">
        <h2 className="text-sm font-semibold text-[rgb(var(--admin-text))]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-xs text-[rgb(var(--admin-text-muted))]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
