import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';

interface StickyFormActionsProps {
  onCancel: () => void;
  onSave: () => void;
  isSaving?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
}

export function StickyFormActions({
  onCancel,
  onSave,
  isSaving,
  saveLabel = 'Kaydet',
  cancelLabel = 'İptal',
  className,
}: StickyFormActionsProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 z-10 -mx-1 mt-6 flex items-center justify-end gap-2 border-t border-[rgb(var(--admin-border))] bg-[rgb(var(--admin-bg))]/95 px-1 py-3 backdrop-blur-sm',
        className,
      )}
    >
      <Button variant="secondary" type="button" onClick={onCancel} disabled={isSaving}>
        {cancelLabel}
      </Button>
      <Button type="button" onClick={onSave} isLoading={isSaving}>
        {saveLabel}
      </Button>
    </div>
  );
}
