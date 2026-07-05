import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Button } from './Button';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  size = 'sm',
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute top-0 flex h-full w-full flex-col border-slate-200 bg-white shadow-xl',
          sizeClasses[size],
          side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Kapat">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>
        {footer ? (
          <div className="border-t border-slate-100 px-4 py-3">{footer}</div>
        ) : null}
      </aside>
    </div>
  );
}
