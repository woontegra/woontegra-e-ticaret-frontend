import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useToastStore, type ToastVariant } from './toast.store';

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  info: 'border-slate-200 bg-white text-slate-900',
};

export function Toaster() {
  const items = useToastStore((state) => state.items);
  const dismiss = useToastStore((state) => state.dismiss);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[100] flex w-full max-w-sm flex-col gap-2 px-3 sm:bottom-4 sm:right-4 sm:px-0"
      aria-live="polite"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            'pointer-events-auto flex items-start gap-2 rounded-md border px-3 py-2 text-sm shadow-sm',
            variantStyles[item.variant],
          )}
        >
          <p className="min-w-0 flex-1">{item.message}</p>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
            aria-label="Kapat"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
